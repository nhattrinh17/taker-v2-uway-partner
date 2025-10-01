import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import React from 'react';
import { Fonts, Icons } from '../assets';
import { formatCurrency } from '../ultils';
import { navigate } from '../navigation/utils/navigationUtils';
import { Colors } from '../assets/Colors';
import { scale } from '../ultils';

interface WalletHeaderProps {
  balance: number;
  average: number;
}
const WalletHeader: React.FC<WalletHeaderProps> = ({ balance, average }) => {

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.walletSection}
        onPress={() => navigate('WalletStack', { screen: 'Wallet' })}
        activeOpacity={0.8}
      >
        <Icons.WalletTabActive width={scale(35)} height={scale(35)} />
        <View style={styles.textContainer}>
          <Text style={styles.textTitle}>Số dư ví</Text>
          <Text style={styles.textContent} numberOfLines={1}>
            {formatCurrency(!balance ? '0' : balance.toString())}đ
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity>
        <View style={styles.historyContainer}>
          <Icons.StarActive width={scale(35)} height={scale(35)} />
          <View>
            <Text style={styles.infoLabel}>Điểm đánh giá</Text>
            <Text style={styles.infoValue}>{average.toFixed(1)}/5</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default WalletHeader;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: scale(20),
    borderRadius: scale(18),
    paddingHorizontal: scale(24),
    paddingVertical: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //gap: scale(2), // Tăng gap để tạo khoảng cách lớn hơn
    elevation: 10,
    transform: [{ translateY: scale(5) }],
  },
  walletSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxWidth: '70%', // Giảm maxWidth để tạo thêm không gian
    flexShrink: 1,
  },
  textContainer: {
    marginLeft: scale(2),
    flexShrink: 1,
  },
  historyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0, 
  },
  textTitle: {
    fontFamily: Fonts.fontFamily.LexendBold,
    fontSize: scale(16),
    color: Colors.black,
    fontWeight: 'bold',
  },
  textContent: {
    fontSize: scale(15),
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.black,
    lineHeight: scale(24),
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: scale(150),
  },
  infoLabel: {
    fontSize: scale(16),
    color: Colors.black,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: scale(15),
    fontWeight: '600',
    marginLeft: scale(4),
  },
});