import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootNavigatorParamList } from '../typings';
import { View, Text, StyleSheet } from 'react-native';
import Wallet from '../../modules/wallet/wallet';

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

const WalletStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Wallet">
      <Stack.Screen name="Wallet" component={Wallet} />
    </Stack.Navigator>
  );
};

export default WalletStack;
