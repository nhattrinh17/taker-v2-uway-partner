import { useState } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';

import { Platform } from 'react-native';
import { useGetSignedUrl } from '../services/profile';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

export const useUploadBill = (onUpload?: (fileName: string) => void) => {
  const { triggerGetSignedUrl } = useGetSignedUrl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSignedUrl = async (fileName: string) => {
    try {
      setLoading(true);
      const response = await triggerGetSignedUrl(fileName);
      return response.data.data;
    } catch (error) {
      console.log('Error getting signed URL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const upload = async (url: string, selectedImage: { uri: any; type: any }) => {
    try {
      const base64Image = await RNFS.readFile(selectedImage.uri, 'base64');
      const binaryData = Buffer.from(base64Image, 'base64');
      const response = await axios.put(url, binaryData, {
        headers: {
          'Content-Type': selectedImage.type,
        },
      });
      return response;
    } catch (error) {
      console.log('Error uploading to S3:', error);
      throw error;
    }
  };

  const uploadImage = async (imageUrl: string) => {
    try {
      console.log('🚀 ~ uploadImage ~ imageUrl:', imageUrl);
      setLoading(true);

      // Check if the file exists before proceeding
      try {
        const fileExists = await RNFS.exists(imageUrl);
        if (!fileExists) {
          throw new Error(`File does not exist at path: ${imageUrl}`);
        }
      } catch (existsError) {
        throw existsError;
      }

      // Fix URI for Android if needed
      const normalizedUri = Platform.OS === 'android' && !imageUrl.startsWith('file:') ? `file://${imageUrl}` : imageUrl;

      let resizedImage = { uri: normalizedUri, type: 'image/jpeg' };
      let quality = 80;

      // Get file size
      try {
        const fileInfo = await RNFS.stat(normalizedUri);
        let fileSize = fileInfo.size;

        // Resize if needed
        while (fileSize > 50 * 1024) {
          quality -= 10;
          if (quality < 10) {
            // Prevent infinite loop with very large images
            quality = 10;
            break;
          }

          const resizedResult = await ImageResizer.createResizedImage(normalizedUri, 800, 800, 'JPEG', quality);
          resizedImage = { uri: resizedResult.uri, type: 'image/jpeg' };

          const resizedFileInfo = await RNFS.stat(resizedResult.uri);
          fileSize = resizedFileInfo.size;
        }
      } catch (resizeError) {
        console.log('Error resizing image:', resizeError);
        throw resizeError;
      }

      // Upload file
      const fileType = 'jpeg';
      const fileName = `${new Date().getTime()}.${fileType}`;
      console.log('🚀 ~ uploadImage ~ fileName:', fileName);

      try {
        const url = await getSignedUrl(fileName);
        if (!url) {
          throw new Error('Failed to get signed URL');
        }
        console.log('🚀 ~ uploadImage ~ signedUrl received');

        const responseS3 = await upload(url, resizedImage);
        if (responseS3?.status === 200) {
          console.log('🚀 ~ uploadImage ~ upload successful, fileName:', fileName);
          onUpload?.(fileName);
          return fileName;
        } else {
          throw new Error('Upload failed with status: ' + responseS3?.status);
        }
      } catch (uploadError) {
        console.log('Error during upload process:', uploadError);
        throw uploadError;
      }
    } catch (err: any) {
      console.log('Error in uploadImage:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, error };
};

export default useUploadBill;
