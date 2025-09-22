import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Share, Clipboard, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';

import { Colors } from '../../assets/Colors';
import { Fonts } from '../../assets';
import Header from '../../components/Header';
import CommonText from '../../components/CommonText';
import { Icons } from '../../assets';
import { Images } from '../../assets/Images';
import FastImage from 'react-native-fast-image';
import { s3Url } from '../../services/APIConfig';
import { showMessageSuccess } from '../../ultils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../states/user';
import { checkAvatarGoogle } from '../../ultils/validation';


type Props = {};

const Endow = (props: Props) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const { user } = useUserStore();
  console.log('User', user);
  // Get referral code from user data
  const referralCode = user?.phone || '01234569789';
  const referralLink = `https://ximiapp.com/referral/${referralCode}`;

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    console.log('Húhhuuhu');
    showMessageSuccess('Mã giới thiệu đã được sao chép');
  };

  const renderReferralItem = ({ item }: { item: any }) => (
    <View style={styles.referralItem}>
      <View style={styles.itemContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <FastImage
            style={styles.avatar}
            source={{
              uri: checkAvatarGoogle(item.avatar),
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>

        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.userNameRow}>
            <CommonText text={item.fullName} styles={styles.userName} />
          </View>
          <View style={styles.userDetailsRow}>
            <View style={{ width: 20 }}>
              <Icons.Phone width={16} height={16} />
            </View>
            <CommonText text={`*****${item.phone.slice(-4)}`} styles={styles.userPhone} />
          </View>
          <View style={styles.joinDateRow}>
            <View style={{ width: 20 }}>
              <Icons.Time width={16} height={16} />
            </View>
            <CommonText
              text={`Tham gia ${new Date(item.createdAt)
                .toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
                .replace(/\//g, '.')}`}
              styles={styles.joinDateText}
            />
          </View>
        </View>
        {/* Action Section */}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.main} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <CommonText text="Chưa có người được giới thiệu" styles={styles.emptyText} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Giới thiệu nhận ưu đãi" />

      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={refreshing}  />}>
        {/* Referral Info Section */}
        <View style={styles.infoSection}>
          <CommonText text={`Cùng mời bạn bè sử dụng Uway nào!`} styles={styles.infoText} />
        </View>

        {/* Referral Code Section */}
        <View style={styles.codeSection}>
          <CommonText text="Mã giới thiệu" styles={styles.sectionTitle} />

          <View style={styles.codeContainer}>
            <View style={styles.codeInputContainer}>
              <CommonText text={referralCode} styles={styles.codeText} />
              <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                <Icons.Paste width={42} height={42} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner Section */}
          <View style={styles.qrContainer}>
            <View style={styles.bannerBox}>
              {/* Decorative elements */}
              <View style={styles.decorativeElements}>
                <View style={styles.circle1} />
                <View style={styles.circle2} />
                <View style={styles.circle3} />
              </View>

              {/* Content Container */}
              <View style={styles.bannerContent}>
                {/* Left side - Text Content */}
                <View style={styles.textSection}>
                  <Text style={styles.bannerTitle}>Giới thiệu bạn kích</Text>
                  <Text style={styles.bannerTitle}>hoạt tính năng</Text>
                  <Text style={styles.bannerSubtitle}>Siêu Tài Khoản</Text>
                </View>

                {/* Right side - Reward */}
                <View style={styles.rewardSection}>
                  <View style={styles.giftIconContainer}>
                    <Icons.Gift2 width={32} height={32} />
                  </View>
                  <Text style={styles.rewardText}></Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Referral List Section */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Endow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoText: {
    fontSize: Fonts.fontSize[14],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.textPrimary,
    lineHeight: 20,
    textAlign: 'left',
  },
  codeSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  codeContainer: {
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gallery,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    paddingVertical: 5,
  },
  codeText: {
    flex: 1,
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendMedium,
    color: Colors.textPrimary,
  },
  copyButton: {
    position: 'relative',
    transform: [{ translateY: 5 }],
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeBox: {
    width: 120,
    height: 120,
    backgroundColor: Colors.main,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerBox: {
    width: '100%',
    backgroundColor: Colors.main,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    zIndex: 1,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  rewardSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  giftIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: Fonts.fontSize[18],
    fontFamily: Fonts.fontFamily.LexendBold,
    color: Colors.white,
    textAlign: 'center',
  },
  bannerTitle: {
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: Colors.white,
    lineHeight: 22,
  },
  bannerSubtitle: {
    fontSize: Fonts.fontSize[18],
    fontFamily: Fonts.fontFamily.LexendBold,
    color: Colors.white,
    marginTop: 4,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -30,
    left: -30,
  },
  circle2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -20,
    right: 50,
  },
  circle3: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    bottom: 30,
    left: 20,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  referralItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarSection: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.mainLight,
  },
  defaultAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.gallery,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.grayLight,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userInfoSection: {
    flex: 1,
    marginRight: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: Colors.black,
    marginRight: 6,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    padding: 2,
  },
  userDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: Fonts.fontSize[13],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.black,
    marginLeft: 6,
  },
  joinDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinDateText: {
    fontSize: Fonts.fontSize[12],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.black,
    marginLeft: 6,
  },
  actionSection: {
    alignItems: 'flex-end',
  },
  successBadge: {
    backgroundColor: Colors.mainBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  successText: {
    fontSize: Fonts.fontSize[10],
    fontFamily: Fonts.fontFamily.LexendMedium,
    color: Colors.green,
  },
  dateText: {
    fontSize: Fonts.fontSize[12],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.gray,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.black,
  },
});
