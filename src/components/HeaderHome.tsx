import React, { useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUserStore } from "../states/user";
import WalletHeader from "./Wallet";
import { Images } from "../assets/Images";
import { Image } from "react-native";
import { scale } from "../ultils";
import { Icons } from "../assets";
import { useGetWalletBalance } from "../services/wallet";
import { useGetRatingAverage } from "../services/rating";

const HeaderHome = () => {
  const { user, balance, setBalance } = useUserStore(state => state);
  const { triggerGetWalletBalance } = useGetWalletBalance();
  const { triggerGetRatingAverage } = useGetRatingAverage();
  const [error, setError] = useState('');
  const [average, setAverage] = useState<number>();

  console.log('HeaderHome user:', user);
  console.log('HeaderHome balance:', balance);

  const getBalance = async () => {
    try {
      const res = await triggerGetWalletBalance();
      setBalance(res.data);

    } catch (err) {
      setError('Không thể tải số dư. Vui lòng thử lại.');
    }
  };

  const getAverage = async () => {
    try {
      const res = await triggerGetRatingAverage();
      setAverage(res.data.averageRating);
      console.log('Average', res.data.averageRating);
    } catch (err) {
      setError('Không thể tải số dư. Vui lòng thử lại.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      getBalance();
      getAverage();
    }, []),
  );

  return (
    <View style={styles.headerContainer}>
      <Image
        source={Images.backgroundhome}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Image source={Images.LogoApp} style={styles.logo} />
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcome}>Xin chào, {user.name}</Text>
            <Text style={styles.subWelcomeApp}>
              Chào mừng bạn đến với <Text style={styles.appName}>Uway</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifButton}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>123 </Text>
            <Icons.Bell width={scale(20)} height={scale(20)} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <WalletHeader balance={balance} average={average ?? 0} />

    </View>
  )
}

export default HeaderHome;

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    height: scale(280), // Adjust height to cover header and part of WalletHeader
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 24,   // bo góc trái dưới
    borderBottomRightRadius: 24,  // bo góc phải dưới
    overflow: 'hidden',

  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(20),
    zIndex: 1, // Ensure content is above the background image

  },
  appName: {
    fontWeight: 'bold',
    color: '#078b94ff',
  },
  subWelcomeApp: {
    fontSize: scale(14),
    color: '#777',
    marginTop: scale(4),
  },
  welcome: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
  },
  welcomeTextContainer: {
    marginTop: scale(2),
  },
  logo: {
    width: scale(100),
    height: scale(60),
    resizeMode: 'contain',
    marginTop: scale(15),
  },
  notifButton: {
    padding: scale(8),
    borderRadius: scale(20),
    backgroundColor: '#f2f2f2',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -scale(5),
    right: -scale(5),
    backgroundColor: '#fff',
    borderRadius: scale(18),
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#000000ff',
    fontSize: scale(14),
    marginRight: scale(2),
  },
});