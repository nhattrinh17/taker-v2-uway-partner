import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootNavigatorParamList } from '../typings';
import { View, Text, StyleSheet } from 'react-native';
import Notification from '../../modules/notification/Notification';

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

const NotificationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Notification">
      <Stack.Screen name="Notification" component={Notification} />
    </Stack.Navigator>
  );
};

export default NotificationStack;