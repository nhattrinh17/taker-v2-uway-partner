import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ✅ Import Colors và Icons từ project của bạn
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';

// ✅ Cập nhật mảng để sử dụng component icon
// Bạn cần thay thế tên icon bằng tên chính xác trong file Icons của bạn.
const HELP_ITEMS = [
  { icon: Icons.Cashback, title: 'Vấn đề hoàn tiền và thanh toán' },
  { icon: Icons.Voucher, title: 'Khuyến mãi & ưu đãi' },
  { icon: Icons.Deliverytruck, title: 'Đơn hàng & vận chuyển' },
  { icon: Icons.Start, title: 'Phản hồi chất lượng tài xế & phương tiện' },
  { icon: Icons.Recuitcard, title: 'Tuyển dụng nhà xe & tài xế' },
  { icon: Icons.Accountproblem, title: 'Vấn đề tài khoản' },
  { icon: Icons.Useproblem, title: 'Vấn đề về ứng dụng' },
];


const SupportCenter = () => {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Header Section (Back button and Title) */}
      <View style={[styles.headerContainer, { paddingTop: top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icons.BackbuttonProfile width={45} height={45} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm hỗ trợ</Text>
        <View style={{ width: 45 }} />
      </View>

      {/* Search Section (Blue background) */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <View style={styles.searchIconContainer}>
            <Icons.Searchsupport width={20} height={20} />
          </View>
          <TextInput
            placeholder="Bạn cần hỗ trợ điều gì"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Content List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
  {HELP_ITEMS.map((item, index) => {
    const IconComponent = item.icon;
    return (
      <React.Fragment key={index}>
        <TouchableOpacity style={styles.itemRow}>
          <View style={styles.itemIconContainer}>
            <IconComponent width={24} height={24} />
          </View>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Icons.NextArrow width={12} height={12} />
        </TouchableOpacity>
        {index < HELP_ITEMS.length - 1 && <View style={styles.divider} />}
      </React.Fragment>
    );
  })}
</ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7FAFC', // Light background color from Figma
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 80,
    backgroundColor: '#F7FAFC',
    marginBottom: 30,  // Match root background
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30, 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 15,  // Dark text for light background
  },
  searchSection: {
    backgroundColor: Colors.primary, // Blue background
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  scrollContainer: {
    backgroundColor: Colors.white, // List items have a white background container
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden', // Ensures divider doesn't stick out
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 14,
  },
  itemIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0', // Light grey divider
    marginLeft: 56, 
  },
});

export default SupportCenter;
