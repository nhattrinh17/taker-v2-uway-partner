import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, ActionSheetIOS, StyleSheet, Alert, PermissionsAndroid, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Icons } from '../assets';
import { appStore } from '../states/app';
import useUpload from '../ultils/useUpload';
import { useGetInfo, useUpdateInfo } from '../services/profile';
import { useUserStore } from '../states/user';
import { Image } from 'react-native';
import { s3Url } from '../services/APIConfig';
import { checkAvatarGoogle } from '../ultils/validation';

const styles = StyleSheet.create({
  containerAvatar: {},
  cameraIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  fastImage: {
    width: 84,
    height: 84,
    borderRadius: 52,
  },
});

const Avatar = () => {
  const { setLoading, loading } = appStore((state: any) => state);
  const { user, setUser } = useUserStore(state => state);
  const { uploadImage } = useUpload();
  const { triggerUpdateInfo, errorUpdateInfo } = useUpdateInfo();
  const { triggerGetInfo } = useGetInfo();
  const updateAvatar = async (response: ImagePickerResponse) => {
    setLoading(true);
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorCode);
    } else if (response.assets && response.assets.length > 0) {
      try {
        const source = response.assets[0].uri;
        console.log('Image source URI:', source);
        if (source) {
          const publicUrl = await uploadImage(source);
          console.log('Uploaded image URL:', publicUrl);

          if (publicUrl) {
            const res = await triggerUpdateInfo({
              avatar: publicUrl,
            });
            const resData = await triggerGetInfo();
            setUser(resData.data);
          }
        }
      } catch (error) {
        console.log('==>Log:',error);
        Alert.alert('Upload Error', 'Failed to process the image. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const takePhoto = async () => {
    try {
      let granted;
      if (Platform.OS === 'android') {
        granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
      }
      if (Platform.OS === 'ios' || granted === PermissionsAndroid.RESULTS.GRANTED) {
        launchCamera({ mediaType: 'photo' }, response => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else {
            updateAvatar(response);
          }
        });
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const chooseFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
          console.log('❌ User cancelled image picker');
        } else if (response.errorCode) {
          console.log('📛 ImagePicker Error: ', response.errorMessage);
        } else {
          console.log('✅ Image selected: ', response.assets);
          updateAvatar(response);
        }
      },
    );
  };

  const showActionSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Huỷ', 'Chụp ảnh', 'Chọn ảnh có sẵn'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            chooseFromLibrary();
          }
        },
      );
    } else {
      // For Android and other platforms
      Alert.alert(
        'Đổi ảnh đại diện',
        '',
        [
          { text: 'Chụp ảnh', onPress: () => takePhoto() },
          { text: 'Chọn ảnh có sẵn', onPress: () => chooseFromLibrary() },
        ],
        { cancelable: true },
      );
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={showActionSheet} style={styles.containerAvatar}>
        {user.avatar ? <Image source={{ uri: checkAvatarGoogle(user.avatar) }} style={styles.fastImage} /> : <Icons.DefaultAvatar style={styles.fastImage} />}
        <View style={styles.cameraIcon}>
          <Icons.Camera />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Avatar;
