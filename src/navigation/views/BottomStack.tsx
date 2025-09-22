import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useCallback } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import HomePageStack from './HomeStack';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { Fonts } from '../../assets/Fonts';
import CommonText from '../../components/CommonText';
import OrderStack from './OrdersStack';
import WalletStack from './WalletStack';
import ProfileStack from './ProfileStack';
import Notification from './NotificationStack';
import { useUserStore } from '../../states/user';
import { replace } from '../utils/navigationUtils';
import { useGetInfo } from '../../services/profile';

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    backgroundColor: 'white',
    height: Platform.OS === 'ios' ? 100 : 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E7EEF4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  itemStack: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '20%',
    height: 50,
    paddingBottom: 5,
  },
  nameTab: {
    lineHeight: 18,
    fontSize: Fonts.fontSize[12],
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    height: 20,
    textAlign: 'center',
  },
  activePill: {
    position: 'absolute',
    top: -16,
    width: 34,
    height: 5,
    borderRadius: 12,
    backgroundColor: Colors.blue,
  },
});

const BottomStack = () => {
  const { token, setToken, setUser } = useUserStore(state => state);
  const { triggerGetInfo } = useGetInfo();
  console.log("[useGetInfo] token:", useUserStore.getState().token);
  
   const getWallet = async () => {
  const token = useUserStore.getState().token;

  // Nếu chưa có token => đá sang login luôn
  if (!token) {
    replace('AuthStack', { screen: 'Login' });
    return;
  }

  try {
    const ress = await triggerGetInfo();
    console.log('🚀 ~ User ~ res:--------------', ress.data);
    setUser(ress.data);
  } catch (err) {
    console.log('❌ Lỗi getInfo:', err);
    // Token hết hạn hoặc API fail => logout
    setToken('');
    replace('AuthStack', { screen: 'Login' });
  }
};

  // Check login status when the app starts
  useFocusEffect(
    useCallback(() => {
      getWallet();
    }, []),
  );

  const getColorIcon = (focused: boolean) => (focused ? Colors.blue : '#868686');

  const renderIconTabBar = (nameStack: string, focused: boolean) => {
    const size = 30;
    const size2= 33;
    switch (nameStack) {
      case 'HomeStack':
        return focused ? <Icons.HometabActive width={size2} height={size2} /> : <Icons.Hometab width={size} height={size} />;
      case 'OrderStack':
        return focused ? <Icons.OrdertabActive width={size2} height={size2} /> : <Icons.Ordertab width={size} height={size} />;
      case 'ProfileStack':
        return focused ? <Icons.PersonalTabActive width={size2} height={size2} /> : <Icons.PersonalTab width={size} height={size} />;
      case 'WalletStack':
        return focused ? <Icons.WalletTabActive width={size2} height={size2} /> : <Icons.WalletTab width={size} height={size} />;
      case 'Notification':
        return focused ? <Icons.NotificationTabactive width={size2} height={size2} /> : <Icons.NotificationTab width={size} height={size} />;
      default:
        return null;
    }
  };

  const renderNameTabBar = (nameStack: string, focused: boolean) => {
    const color = getColorIcon(focused);
    switch (nameStack) {
      case 'HomeStack':
        return <CommonText text="Trang chủ" styles={[styles.nameTab, { color }]} />;
      case 'OrderStack':
        return <CommonText text="Đơn hàng" styles={[styles.nameTab, { color }]} />;
      case 'ProfileStack':
        return <CommonText text="Cá nhân" styles={[styles.nameTab, { color }]} />;
      case 'WalletStack':
        return <CommonText text="Tài khoản" styles={[styles.nameTab, { color }]} />;
      case 'Notification':
        return <CommonText text="Thông báo" styles={[styles.nameTab, { color }]} />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: BottomTabBarProps) => {
    const { state: { routes, index, routeNames }, navigation } = props;

    return (
      <View style={styles.tabBar}>
        {routes.map((stack, indexStack) => {
          const focused = indexStack === index;

          const onPressStack = () => {
            const target = routeNames[indexStack];
            if (!focused) navigation.navigate(target as never);
          };

          return (
            <TouchableOpacity key={stack.key} style={styles.itemStack} onPress={onPressStack} activeOpacity={0.85}>
              {focused && <View style={styles.activePill} />}
              {renderIconTabBar(stack.name, focused)}
              {renderNameTabBar(stack.name, focused)}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false, lazy: false }}>
      <Tab.Screen name="HomeStack" component={HomePageStack} />
      <Tab.Screen name="OrderStack" component={OrderStack} />
      <Tab.Screen name="ProfileStack" component={ProfileStack} />
      <Tab.Screen name="WalletStack" component={WalletStack} />
      <Tab.Screen name="Notification" component={Notification} />
    </Tab.Navigator>
  );
};

export default BottomStack;