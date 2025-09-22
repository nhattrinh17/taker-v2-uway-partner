import React from 'react';
import { Image } from 'react-native';
import { View } from 'react-native';
import { Images } from '../assets/Images';
import { styles } from '../modules/auth/authStyles';

export default function Logo() {
  return (
    <View style={styles.logo}>
      <Image source={Images.LogoApp} style={styles.logoApp} />
    </View>
  );
}
