import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {Images} from '../../assets/Images';

export default function SplashScreen() {
  return (
    <View style={s.c}>
      <Image source={Images.LogoApp} style={s.logo} resizeMode="contain" />
    </View>
  );
}
const s = StyleSheet.create({
  c: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9F2F7'},
  logo: {width: 180, height: 60},
});
