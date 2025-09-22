import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { RootNavigatorParamList } from '../typings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { appStore } from '../../states/app';
import { useUserStore } from '../../states/user';
import { Fonts } from '../../assets';
import { Colors } from '../../assets/Colors';
import { navigationRef } from '../utils/navigationUtils';
import SplashScreen from '../../modules/onboarding/Splashscreen';
import MainStack from './MainStack';
import OnboardingStack from './OnboardingStack';
import AuthStack from './AuthStack'; // 👈 thêm cái này

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

const styles = StyleSheet.create({
  text2Style: {
    fontSize: Fonts.fontSize[14],
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: 'black',
  },
  typeSuccess: {
    borderLeftColor: Colors.green,
  },
  typeError: {
    borderLeftColor: Colors.red,
  },
  typeInfo: {
    borderLeftColor: 'yellow',
  },
});

export default function RootNavigation() {
  const hydrated = appStore(s => s.hydrated);
  const seen = appStore(s => s.hasSeenOnboarding);
  const token = useUserStore(s => s.token); // 👈 lấy token từ store

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hydrated) {
      const t = setTimeout(() => setReady(true), 300); // splash tối thiểu 300ms
      return () => clearTimeout(t);
    }
  }, [hydrated]);

  if (!ready) return <SplashScreen />;

  return (
    <NavigationContainer ref={navigationRef}>
      {!seen ? (
        <OnboardingStack />
      ) : token ? (
        <MainStack />   // 👈 Đã đăng nhập
      ) : (
        <AuthStack />   // 👈 Chưa đăng nhập
      )}
    </NavigationContainer>
  );
}
