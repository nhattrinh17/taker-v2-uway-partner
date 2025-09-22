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
      outputRange: [0, 60],
      extrapolate: 'clamp',
    });

    const scale = progress.interpolate({
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
              transform: [{ translateX: trans }, { scale }],
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
          <Icons.BackbuttonProfile width={45} height={45} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi nhánh cửa hàng</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('AddressForm', {})}
        >
          <Icons.Addlocation width={24} height={24} color={Colors.primary} />
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
          borderWidth: address.isDefault ? 2 : 1,
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
          <Icons.Locationdetail width={24} height={24} style={styles.locationIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel} numberOfLines={2}>{address.address}</Text>
            <Text style={styles.cardAddress} numberOfLines={2} >{address.label || 'Không có địa chỉ chi tiết'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddressForm', { address })}
        >
          <Icons.Editlocation width={28} height={28} color={Colors.primary} />
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
    paddingHorizontal: 16,
    height: 60,
  },
  headerButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  cardPhone: {
    fontSize: 14,
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
    marginRight: 12,
    paddingHorizontal: 18,
    paddingLeft: 1,
  },
  locationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  cardAddress: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 20,
    width: '90%',
  },
  editButton: {
    padding: 8,
  },
  deleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 90,
    marginBottom: 16,
    paddingRight: 10,
    backgroundColor: 'transparent',
  },
  deleteButton: {
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
  errorText: {
    fontSize: 14,
    color: Colors.red,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.gray,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: Colors.red,
  },
  confirmButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default LocationManage;