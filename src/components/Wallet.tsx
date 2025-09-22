import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import React from 'react';
import { Fonts, Icons } from '../assets';
import { formatCurrency } from '../ultils';
import { navigate } from '../navigation/utils/navigationUtils';
import { Colors } from '../assets/Colors';
const { width } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;

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
        <Icons.WalletTabActive width={35} height={35} />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.textTitle}>Số dư ví</Text>
          <Text style={styles.textContent}>
            {formatCurrency(!balance ? '0' : balance.toString())}đ
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity >
        <View style={styles.historyContainer}>
          <View>
            <Icons.StarActive width={35} height={35} />
          </View>
          <View>
              <Text style={styles.infoLabel}>Điểm đánh giá</Text>
              <Text style={styles.infoValue}> {average.toFixed(1)}/5</Text>
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
    marginHorizontal: 20,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    transform: [{ translateY: 5 }],
    gap: 16,
  },
  walletSection: {
    flexDirection: 'row',
    gap: 8,
    width: '55%',
    alignItems: 'center',
    paddingLeft: 15,
  },
  infoLabel: {
    fontSize: scale(16),
    color: 'black',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: scale(16),
    fontWeight: '600',
  },
  historyContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '60%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  textTitle: {
    fontFamily: Fonts.fontFamily.LexendBold,
    fontSize: scale(16),
    color: 'black',
    fontWeight: 'bold',
  },
  textContent: {
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.black,
    lineHeight: 24,
  },
});
