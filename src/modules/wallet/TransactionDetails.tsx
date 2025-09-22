import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootNavigatorParamList } from '../../navigation/typings';
import Header from '../../components/Header';
import { Colors } from '../../assets/Colors';
import { Fonts } from '../../assets';
import { useUserStore } from '../../states/user';
import { TRANSACTION_STATUS_COLOR, TRANSACTION_STATUS } from '../../ultils';

type Props = { route: RouteProp<RootNavigatorParamList, 'TransactionDetail'> };

const TransactionDetail = ({ route }: Props) => {
  const { item } = route.params;
  const { user } = useUserStore(state => state)
  console.log('==>item: ', item, user);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const convertStatus = (status: string) => {
    if (status === 'SUCCESS' || status === 'REFUND') return 'Thành công';
    if (status === 'PENDING') return 'Chờ duyệt';
    if (status === 'FAILED') return 'Thất bại';
    return '';
  };

  const renderRow = (label: string, value: string, valueStyle?: TextStyle) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Chi tiết giao dịch" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thông tin người nhận */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
          {renderRow('Chủ tài khoản',user.bankAccountName ?? 'Chưa cập nhật')}
          {renderRow('Số tài khoản', user.bankAccountNumber ?? 'Chưa cập nhật')}
          {renderRow('Ngân hàng', user.bankName ?? 'Chưa cập nhật')}
        </View>

        {/* Chi tiết giao dịch */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết giao dịch</Text>
          {renderRow('Mã giao dịch', item.id)}
          {renderRow('Ngày giao dịch', formatDate(item.transactionDate))}
          {renderRow('Số tiền', `${item.amount.toLocaleString('vi-VN')}đ`)}
          {renderRow('Trạng thái', TRANSACTION_STATUS(item.status), { color: TRANSACTION_STATUS_COLOR(item.status) })}
          {renderRow(
            'Loại giao dịch',
            item.transactionType === 'DEPOSIT'
              ? 'Nạp tiền'
              : item.transactionType === 'WITHDRAW'
              ? 'Rút tiền'
              : 'Thanh toán'
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flex: 1 },
  section: {
    backgroundColor: Colors.white,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendBold,
    color: Colors.black,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  label: {
    fontSize: Fonts.fontSize[14],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.grayDark,
    flex: 1,
  },
  value: {
    fontSize: Fonts.fontSize[14],
    fontFamily: Fonts.fontFamily.LexendMedium,
    color: Colors.black,
    flex: 1,
    textAlign: 'right',
  },
});
