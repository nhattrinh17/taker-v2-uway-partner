import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootNavigatorParamList } from '../typings';
import Login from '../../modules/auth/Login';
import SignUp from '../../modules/auth/SignUp.tsx';
 import Otp from '../../modules/auth/Otp.tsx';
import ForgotPassword from '../../modules/auth/ForgotPassword.tsx';
import ChangePassword from '../../modules/auth/ChangePassword.tsx';

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
       <Stack.Screen name="ChangePassword" component={ChangePassword} />
    </Stack.Navigator>
  );
};

export default AuthStack;
