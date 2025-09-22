import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Component } from 'react';
import Home from '../../modules/home/home';
import { RootNavigatorParamList } from '../typings';
import AcceptDetail from '../../modules/home/AcceptDetail';


const Stack = createNativeStackNavigator<RootNavigatorParamList>();

const HomeStack = () =>{
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
            <Stack.Screen name='Home' component={Home} />  
            
        </Stack.Navigator>
    );
}
export default HomeStack;