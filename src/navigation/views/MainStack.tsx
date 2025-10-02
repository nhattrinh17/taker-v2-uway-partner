import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../../assets/Colors';

// Root type cho navigator
import { RootNavigatorParamList } from '../typings';

// Stacks
import BottomStack from './BottomStack';
import HomeStack from './HomeStack';
import AuthStack from './AuthStack';
import WalletStack from './WalletStack';
// import HomeStack from './HomeStack';
import Information from '../../modules/profile/Information';
import ChangePass from '../../modules/profile/ChangePass';
import Deposit from '../../modules/wallet/Deposit';
import Withdraw from '../../modules/wallet/Withdraw';
import TransactionDetail from '../../modules/wallet/TransactionDetails';
import OrderStack from './OrdersStack';
import { SafeAreaView } from 'react-native-safe-area-context';
// import ServiceStack from './ServiceStack';
// import DeliveryStack from './DeliveryStack';
import SupportCenter from '../../modules/profile/SupportCenter';
import LocationManage from '../../modules/profile/LocationManage';
import AddressForm from '../../modules/profile/AddressForm';
import ForgotPassword from '../../modules/auth/ForgotPassword';
import AddressSearchScreen from '../../modules/profile/AddressSearchScreen';
import Endow from '../../modules/profile/Endow';
import OrderDetail from '../../modules/order/OrderDetail';
import OrderProgress from '../../modules/order/OrderProgress';
import InCome from '../../modules/wallet/InCome';
import Review from '../../modules/order/Review';
import { SocketService, SocketEvent } from '../../services/socket';
import { useUserStore } from '../../states/user';
import AcceptDetail from '../../modules/home/AcceptDetail';

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

export default function MainStack() {
  // có thể đặt useEffect cho socket, notification... giống file Xiin
  const { token, user, setUser } = useUserStore(state => state);
  const socketRef = useRef<SocketService>(null);

  // Initialize socket with token
  useEffect(() => {
    console.log('token1: ', token);
    if (token) {
      socketRef.current = SocketService.getInstance(token);
      console.log('socket', socketRef.current);
    }
  }, [token]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <StatusBar translucent barStyle="dark-content" backgroundColor={Colors.transparent} />
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="BottomStack"
      >
        {/* Tab bar chính */}
        <Stack.Screen name="BottomStack" component={BottomStack} />
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="HomeStack" component={HomeStack} />
        <Stack.Screen name="SupportCenter" component={SupportCenter} />
        <Stack.Screen name="Information" component={Information} />
        <Stack.Screen name="Changepass" component={ChangePass} />
        <Stack.Screen name="LocationManage" component={LocationManage} />
        <Stack.Screen name="AddressForm" component={AddressForm} />
        <Stack.Screen name="WalletStack" component={WalletStack} />
        <Stack.Screen name="Deposit" component={Deposit} />
        <Stack.Screen name="WithDraw" component={Withdraw} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetail} />
        <Stack.Screen name="OrdersStack" component={OrderStack} />
        <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
        <Stack.Screen name='AddressSearchScreen' component={AddressSearchScreen} />
        <Stack.Screen name='Endow' component={Endow} />
        <Stack.Screen name='OrderDetail' component={OrderDetail} />
        <Stack.Screen name='OrderProgress' component={OrderProgress} />
        <Stack.Screen name='InCome' component={InCome} />
        <Stack.Screen name='Review' component={Review} />
        <Stack.Screen name='AcceptDetail' component={AcceptDetail} />
        {/* <Stack.Screen name="ChatStack" component={ChatStack} /> */}
        {/* <Stack.Screen name="ServiceStack" component={ServiceStack} /> */}
        {/* <Stack.Screen name="DeliveryStack" component={DeliveryStack} /> */}

        
      </Stack.Navigator>
    </SafeAreaView>
  );
}
