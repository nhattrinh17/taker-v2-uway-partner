import { useState } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import { useGetSignedUrl } from '../services/profile';

export const useUpload = (onUpload?: (fileName: string) => void) => {
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { triggerGetSignedUrl } = useGetSignedUrl();

     const getSignedUrl = async (fileName: string) => {
    try {
      const response = await triggerGetSignedUrl(fileName);
      console.log('response get url: ', response);
      return response.data.data;
    } catch (error) {
      console.log('error get url: ', error);
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
      console.log('error upload: ', error);
    }
  };

    const uploadImage = async (imageUrl: string) => {
        console.log('Starting upload for image:', imageUrl);
        try {
            setLoading(true);

            // Check if the file exists before proceeding
            try {
                const fileExists = await RNFS.exists(imageUrl);
                if (!fileExists) {
                    console.error('File does not exist at path:', imageUrl);
                    throw new Error(`File does not exist at path: ${imageUrl}`);
                }
                console.log('File exists, proceeding with upload');
            } catch (existsError) {
                console.error('Error checking if file exists:', existsError);
                throw existsError;
            }

            // Fix URI for Android if needed
            const normalizedUri = Platform.OS === 'android' && !imageUrl.startsWith('file:') ? `file://${imageUrl}` : imageUrl;

            let resizedImage = { uri: normalizedUri, type: 'image/jpeg' };
            let quality = 80;

            // Get file size
            try {
                const fileInfo = await RNFS.stat(normalizedUri);
                console.log('File size:', fileInfo.size);
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
                    console.log('Resized file size:', fileSize, 'with quality:', quality);
                }
            } catch (resizeError) {
                console.error('Error resizing image:', resizeError);
                throw resizeError;
            }

            // Upload file
            const fileType = 'jpeg';
            const fileName = `${new Date().getTime()}.${fileType}`;
            console.log('Uploading image to:', fileName);
            try {
                const url = await getSignedUrl(fileName);
                if (!url) {
                    console.error('Failed to get signed URL for upload');
                }

                const responseS3 = await upload(url, resizedImage);
                if (responseS3?.status === 200) {
                    onUpload?.(fileName);
                    return fileName;
                } else {
                    throw new Error('Upload failed with status: ' + responseS3?.status);
                }
            } catch (uploadError) {
                console.error('Error during final upload step:', uploadError);
                throw uploadError;
            }
        } catch (err: any) {
            console.error('Error uploading image: ', err);
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    //   const resizeAndCompressImage = async (fileUri: string) => {
    //     let quality = 100;
    //     let newUri = fileUri;
    //     let fileSize = 0;
    //     const targetSize = 200 * 1024;
    //     do {
    //       const resizedImage = await ImageResizer.createResizedImage(newUri, 800, 800, 'JPEG', quality, 0, undefined, false, { mode: 'contain', onlyScaleDown: false });
    //       newUri = resizedImage.uri;
    //       const statResult = await RNFS.stat(newUri);
    //       fileSize = statResult.size;
    //       quality -= 10;
    //     } while (fileSize > targetSize && quality > 0);
    //     if (fileSize <= targetSize) {
    //       console.log(`Image resized and compressed successfully. New size: ${fileSize} bytes`);
    //       return newUri;
    //     } else {
    //       console.error('Unable to reduce the image size to under 50KB');
    //       return null;
    //     }
    //   };

    //   const uploadImageToS3 = async (fileUri: string) => {
    //     console.log('fileUri', fileUri);
    //     try {
    //       const resizedUri = await resizeAndCompressImage(fileUri);
    //       if (!resizedUri) {
    //         throw new Error('Failed to resize and compress image');
    //       }
    //       const fileExtension = resizedUri.split('.').pop();
    //       const fileName = `customers/avatar/${new Date().getTime()}.${fileExtension}`;
    //       const url = await getSignedUrl(fileName);
    //       const responeS3 = await upload(url, resizedUri);
    //       if (responeS3?.status === 200) {
    //         return fileName;
    //       }
    //     } catch (error) {
    //       console.log('error uploadImageToS3: ', error);
    //     }
    //   };

    //   return { uploadImageToS3, uploading };

    const normalizeImageUri = async (imageUri: string) => {
    // Nếu URI rỗng hoặc không phải string, trả về null ngay
    if (!imageUri || typeof imageUri !== 'string') {
      console.warn('normalizeImageUri: URI đầu vào không hợp lệ hoặc rỗng.');
      return '';
    }

    // Nếu là iOS, hoặc là Android nhưng đã là file:// URI, thì không cần xử lý thêm
    if (Platform.OS === 'ios' || imageUri.startsWith('file://')) {
      return imageUri;
    }

    // Xử lý content:// URI trên Android
    if (Platform.OS === 'android' && imageUri.startsWith('content://')) {
      try {
        // Tạo một đường dẫn tạm thời duy nhất trong thư mục cache của ứng dụng
        const tempFilePath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}_normalized_image.jpg`;

        // Sao chép file từ content:// URI sang đường dẫn tạm thời này
        await RNFS.copyFile(imageUri, tempFilePath);

        console.log('Đã chuyển đổi content:// URI sang file://:', tempFilePath);
        return `file://${tempFilePath}`; // Trả về URI dạng file://
      } catch (error) {
        console.error('Lỗi khi chuyển đổi content:// URI:', error);
        return ''; // Trả về null nếu quá trình chuyển đổi thất bại
      }
    }
    return imageUri;
  };

     return { uploadImage, loading, error, normalizeImageUri };
};

export default useUpload;