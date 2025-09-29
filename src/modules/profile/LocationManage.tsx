import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { Images } from '../../assets/Images';
import { RootNavigatorParamList, Address } from '../../navigation/typings';
import { useGetAddress, useDeleteAddress } from '../../services/address';
import { scale } from '../../ultils';

const LocationManage = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootNavigatorParamList>>();
  const { top } = useSafeAreaInsets();
  const { triggerGetAddress } = useGetAddress();
  const { triggerDeleteAddress } = useDeleteAddress();
  const isFocused = useIsFocused();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isFocused) {
      const fetchAddresses = async () => {
        try {
          setError('');
          const res = await triggerGetAddress();
          console.log('[LocationManage] triggerGetAddress response:', res);
          const fetchedAddresses = Array.isArray(res.data.data) ? res.data.data : [];
          console.log('[LocationManage] Setting addresses:', fetchedAddresses);
          const sortedAddresses = fetchedAddresses.sort((a: any, b: any) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
          setAddresses(sortedAddresses);
        } catch (err) {
          console.error('[LocationManage] triggerGetAddress error:', err);
          setError('Không thể tải danh sách địa chỉ. Vui lòng thử lại.');
          setAddresses([]);
        }
      };
      fetchAddresses();
    }
  }, [isFocused, triggerGetAddress]);

  const handleDeleteAddress = async (id: string) => {
    console.log('[LocationManage] Deleting address with ID:', id);
    try {
      await triggerDeleteAddress({ id });
      setAddresses((prev) => prev.filter((item) => item.id !== id));
      setModalVisible(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error('[LocationManage] Delete error:', error);
      setError('Không thể xoá trụ sở chính. Vui lòng thử lại.');
      setModalVisible(false);
      setAddressToDelete(null);
    }
  };

  const showDeleteModal = (id: string) => {
    setAddressToDelete(id);
    setModalVisible(true);
  };

  const renderRightActions = (id: string) => (progress: any, dragX: any) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, scale(60)],
      extrapolate: 'clamp',
    });

    const scaleAnim = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteContainer}>
        <Animated.View
          style={[
            styles.deleteButton,
            {
              transform: [{ translateX: trans }, { scale: scaleAnim }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButtonInner}
            onPress={() => showDeleteModal(id)}
            activeOpacity={0.7}
          >
            <Image source={Images.Delete} style={styles.deleteIcon} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderAddressCard = ({ item }: { item: Address }) => {
    console.log('[LocationManage] Rendering AddressCard:', item);
    return (
      <Swipeable renderRightActions={renderRightActions(item.id)}>
        <AddressCard address={item} navigation={navigation} />
      </Swipeable>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icons.BackbuttonProfile width={scale(45)} height={scale(45)} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi nhánh cửa hàng</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('AddressForm', {})}
        >
          <Icons.Addlocation width={scale(24)} height={scale(24)} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Chi nhánh</Text>

        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Address List or Empty State */}
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderAddressCard}
          ListEmptyComponent={<Text style={styles.emptyText}>Hiện chưa có địa chỉ nào</Text>}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa địa chỉ này không?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setAddressToDelete(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  if (addressToDelete) {
                    handleDeleteAddress(addressToDelete);
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface AddressCardProps {
  address: Address;
  navigation: NativeStackNavigationProp<RootNavigatorParamList>;
}

const AddressCard = ({ address, navigation }: AddressCardProps) => {
  return (
    <View
      style={[
        styles.card,
        {
          borderWidth: address.isDefault ? scale(2) : scale(1),
          borderColor: address.isDefault ? Colors.blue : Colors.black,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={2}>{address.fullName}</Text>
        <View style={styles.separator} />
        <Text style={styles.cardPhone}>{address.phone}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.addressTextContainer}>
          <Icons.Locationdetail
            width={scale(24)}
            height={scale(24)}
            style={styles.locationIcon}
          />
          <View style={styles.addressTextWrapper}>
            <Text style={styles.cardLabel} numberOfLines={2}>
              {address.address}
            </Text>
            <Text style={styles.cardAddress} numberOfLines={2}>
              {address.label || 'Không có địa chỉ chi tiết'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddressForm', { address })}
        >
          <Icons.Editlocation
            width={scale(28)}
            height={scale(28)}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    height: scale(60),
  },
  headerButton: {
    width: scale(45),
    height: scale(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: scale(10),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: scale(12),
  },
  listContainer: {
    paddingBottom: scale(20),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: scale(20),
    padding: scale(20),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to prevent misalignment with long names
    marginBottom: scale(12),
  },
  cardName: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: scale(22), // Added for consistent text spacing
  },
  separator: {
    width: scale(1),
    height: scale(16),
    backgroundColor: Colors.border,
    marginHorizontal: scale(12),
  },
  cardPhone: {
    fontSize: scale(14),
    color: Colors.black,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressTextContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: scale(12),
    paddingHorizontal: scale(8), // Unified padding, removed conflicting paddingLeft
  },
  addressTextWrapper: {
    flexShrink: 1, // Allow text to shrink if needed
  },
  locationIcon: {
    marginRight: scale(12),
    marginTop: scale(2),
  },
  cardLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: scale(4),
    lineHeight: scale(20),
  },
  cardAddress: {
    fontSize: scale(13),
    color: Colors.gray,
    lineHeight: scale(20),
  },
  editButton: {
    padding: scale(8),
  },
  deleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: scale(90),
    marginBottom: scale(16),
    paddingRight: scale(10),
    backgroundColor: 'transparent',
  },
  deleteButton: {
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(70),
    height: '100%',
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.2,
    shadowRadius: scale(4),
    elevation: 3,
  },
  deleteButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(12),
  },
  deleteIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.white,
  },
  errorText: {
    fontSize: scale(14),
    color: Colors.red,
    textAlign: 'center',
    marginBottom: scale(12),
  },
  emptyText: {
    fontSize: scale(14),
    color: Colors.gray,
    textAlign: 'center',
    marginVertical: scale(20),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: scale(16),
    padding: scale(20),
    width: '80%',
    maxWidth: scale(340),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 5,
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: scale(12),
  },
  modalMessage: {
    fontSize: scale(14),
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: scale(20),
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.gray,
  },
  cancelButtonText: {
    fontSize: scale(16),
    color: Colors.white,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: Colors.red,
  },
  confirmButtonText: {
    fontSize: scale(16),
    color: Colors.white,
    fontWeight: '600',
  },
});

export default LocationManage;
