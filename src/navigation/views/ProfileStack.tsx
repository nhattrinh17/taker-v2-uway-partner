import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Person from '../../modules/person/Person';
import Profile from '../../modules/profile/Profile';

import { RootNavigatorParamList } from '../typings';

const Stack = createNativeStackNavigator<RootNavigatorParamList>();
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Profile">
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
