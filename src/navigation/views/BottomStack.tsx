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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from '../../ultils';

const Tab = createBottomTabNavigator();

const BottomStack = () => {
  const { token, setToken, setUser } = useUserStore(state => state);
  const { triggerGetInfo } = useGetInfo();
  const insets = useSafeAreaInsets();

  const getWallet = async () => {
    const token = useUserStore.getState().token;
    if (!token) {
      replace('AuthStack', { screen: 'Login' });
      return;
    }
    try {
      const ress = await triggerGetInfo();
      setUser(ress.data);
    } catch (err) {
      console.log('❌ Lỗi getInfo:', err);
      setToken('');
      replace('AuthStack', { screen: 'Login' });
    }
  };

  useFocusEffect(
    useCallback(() => {
      getWallet();
    }, []),
  );

  const getColorIcon = (focused: boolean) => (focused ? Colors.blue : '#868686');

  const renderIconTabBar = (nameStack: string, focused: boolean) => {
    const size = scale(28);
    const sizeActive = scale(32);
    switch (nameStack) {
      case 'HomeStack':
        return focused ? <Icons.HometabActive width={sizeActive} height={sizeActive} /> : <Icons.Hometab width={size} height={size} />;
      case 'OrderStack':
        return focused ? <Icons.OrdertabActive width={sizeActive} height={sizeActive} /> : <Icons.Ordertab width={size} height={size} />;
      case 'ProfileStack':
        return focused ? <Icons.PersonalTabActive width={sizeActive} height={sizeActive} /> : <Icons.PersonalTab width={size} height={size} />;
      case 'WalletStack':
        return focused ? <Icons.WalletTabActive width={sizeActive} height={sizeActive} /> : <Icons.WalletTab width={size} height={size} />;
      case 'Notification':
        return focused ? <Icons.NotificationTabactive width={sizeActive} height={sizeActive} /> : <Icons.NotificationTab width={size} height={size} />;
      default:
        return null;
    }
  };

  const renderNameTabBar = (nameStack: string, focused: boolean) => {
    const color = getColorIcon(focused);
    return (
      <CommonText
        text={
          nameStack === 'HomeStack' ? 'Trang chủ' :
          nameStack === 'OrderStack' ? 'Đơn hàng' :
          nameStack === 'ProfileStack' ? 'Cá nhân' :
          nameStack === 'WalletStack' ? 'Tài khoản' :
          nameStack === 'Notification' ? 'Thông báo' : ''
        }
        styles={[styles.nameTab, { color }]}
      />
    );
  };

  const renderTabBar = (props: BottomTabBarProps) => {
    const { state: { routes, index, routeNames }, navigation } = props;

    return (
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: insets.bottom + scale(6),
            height: (Platform.OS === 'ios' ? scale(90) : scale(65)) + insets.bottom,
          },
        ]}
      >
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

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: scale(12),
    backgroundColor: 'white',
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
    height: scale(50),
    paddingBottom: scale(4),
  },
  nameTab: {
    lineHeight: scale(18),
    fontSize: Fonts.fontSize[12],
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    height: scale(20),
    textAlign: 'center',
  },
  activePill: {
    position: 'absolute',
    top: -scale(12),
    width: scale(34),
    height: scale(5),
    borderRadius: 12,
    backgroundColor: Colors.blue,
  },
});

export default BottomStack;
