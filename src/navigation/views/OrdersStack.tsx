import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootNavigatorParamList } from '../typings';
import { View, Text, StyleSheet } from 'react-native';
import Orders from '../../modules/order/Order';

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

const OrderStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Orders">
      <Stack.Screen name="Orders" component={Orders} />
    </Stack.Navigator>
  );
};

export default OrderStack;
