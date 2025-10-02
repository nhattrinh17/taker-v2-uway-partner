import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootNavigatorParamList } from '../../navigation/typings';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { useCreateAddress, useUpdateAddress, useGetAddress } from '../../services/address';
import { GOONG_API_KEY } from '../../services/APIConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isValidPhone } from '../../ultils/validation';
import SuccessModal from '../../components/SuccessModal';

// ====== AddressForm Component ======
type AddressFormParams = {
  AddressForm: {
    address?: {
      id?: string;
      address: string;
      location: string; // "lat,lng"
      isDefault: boolean;
      label: string;
      fullName: string;
      phone: string;
      isBranchAddress: boolean;
    };
  };
};

const AddressForm = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootNavigatorParamList>>();
  const route = useRoute<RouteProp<AddressFormParams, 'AddressForm'>>();
  const { top } = useSafeAreaInsets();
  const { triggerCreateAddress } = useCreateAddress();
  const { triggerUpdateAddress } = useUpdateAddress();
  const { triggerGetAddress } = useGetAddress();

  const isEditing = !!route.params?.address;
  const initialData = route.params?.address;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [label, setLabel] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [isBranchAddress, setIsBranchAddress] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [apiError, setApiError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // New state for SuccessModal
  const [hasAnyAddress, setHasAnyAddress] = useState(false);
  const [addressesCount, setAddressesCount] = useState<number | null>(null);
  const [disableToggle, setDisableToggle] = useState(false);
  const [hasHeadquarters, setHasHeadquarters] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkExistingAddresses = async () => {
      try {
        const res = await triggerGetAddress();
        console.log('[AddressForm] Existing addresses:', res);
        const list = Array.isArray(res) ? res : (res?.data.data ?? res ?? []);
        const count = Array.isArray(list) ? list.length : 0;
        console.log('[AddressForm] Existing addresses count:', count, list);
        if (!mounted) return;
        setAddressesCount(count);

        if (!isEditing) {
          if (count === 0) {
            setIsDefault(true);
            setIsBranchAddress(false);
            setDisableToggle(true);
          } else {
            setDisableToggle(false);
          }
        } else {
          if (initialData?.isDefault && count === 1) {
            setDisableToggle(true);
          } else {
            setDisableToggle(false);
          }
        }
      } catch (err) {
        console.error('[AddressForm] checkExistingAddresses error:', err);
        setDisableToggle(false);
        setAddressesCount(null);
      }
    };
    checkExistingAddresses();
    return () => { mounted = false; };
  }, [isEditing, initialData, triggerGetAddress]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isEditing) {
        try {
          const res = await triggerGetAddress();
          const addresses = res?.data.data ?? res ?? [];
          console.log('[AddressForm] Fetched addresses for toggle logic:', addresses);
          setHasAnyAddress(addresses.length > 0);
          setHasHeadquarters(addresses.some((addr: any) => addr.isDefault));
          if (addresses.length === 0) {
            setIsDefault(true);
            setIsBranchAddress(false);
          }
        } catch (err) {
          console.error('[AddressForm] fetchAddresses error:', err);
        }
      }
    };
    fetchAddresses();
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && initialData) {
      setFullName(initialData.fullName || '');
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
      setLocation(initialData.location || '');
      setLabel(initialData.label || '');
      setIsDefault(initialData.isDefault || false);
      setIsBranchAddress(initialData.isBranchAddress || false);
      setQuery(initialData.address || '');
    }
  }, [isEditing, initialData]);

  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    setAddress(text);
    setApiError('');
    if (text.length < 2) {
      setResults([]);
      setLocation('');
      return;
    }
    try {
      console.log('[AddressForm] Fetching suggestions for:', text);
      const res = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(text)}&limit=6`
      );
      const data = await res.json();
      console.log('[AddressForm] API response:', data);
      if (data.status === 'OK' && data.predictions) {
        setResults(data.predictions);
      } else {
        setResults([]);
        setApiError('Không tìm thấy kết quả phù hợp');
      }
    } catch (error) {
      console.error('[AddressForm] Fetch error:', error);
      setApiError('Lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleSelect = async (placeId: string, description: string) => {
    try {
      const res = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`
      );
      const data = await res.json();
      if (data.status === 'OK' && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        setAddress(description);
        setLocation(`${lat},${lng}`);
        setQuery(description);
        setResults([]);
        setApiError('');
      } else {
        setApiError('Không thể lấy chi tiết địa chỉ.');
      }
    } catch (error) {
      console.error('[AddressForm] Detail fetch error:', error);
      setApiError('Lỗi khi lấy chi tiết địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!fullName.trim()) {
        setError('Vui lòng nhập tên chi nhánh.');
        return;
      }
      if (!phone.trim()) {
        setError('Vui lòng nhập số điện thoại.');
        return;
      }
      if (!isValidPhone(phone)) {
        setError('Số điện thoại không đúng định dạng.');
        return;
      }
      if (!address.trim() || !location) {
        setError('Vui lòng chọn một địa chỉ từ danh sách gợi ý.');
        return;
      }
      if (!isEditing && hasHeadquarters && isDefault) {
        setError('Đã có trụ sở chính, vui lòng chọn Địa chỉ chi nhánh.');
        return;
      }
      if (!isDefault && !isBranchAddress) {
        setError('Vui lòng chọn ít nhất một: Đặt làm trụ sở chính hoặc Địa chỉ chi nhánh.');
        return;
      }
      setShowConfirmModal(true);
    } catch (err) {
      console.error('[AddressForm] Error:', err);
      setError('Không thể lưu địa chỉ. Vui lòng thử lại.');
    }
  };

  const confirmSubmit = async () => {
    try {
      setError('');
      const payload: any = {
        address,
        location,
        isDefault,
        label,
        fullName,
        phone,
        isBranchAddress,
      };

      let currentId = initialData?.id;
      if (isEditing && initialData?.id) {
        await triggerUpdateAddress({ id: initialData.id, ...payload });
        currentId = initialData.id;
        console.log('[AddressForm] Address updated:', payload);
      } else {
        const created = await triggerCreateAddress(payload);
        currentId = created?.id || created?.data?.id;
        console.log('[AddressForm] Address created:', payload);
      }

      if (isDefault && currentId) {
        const all = await triggerGetAddress();
        const list = Array.isArray(all) ? all : (all?.data?.data ?? []);
        const others = list.filter((item: any) => item.id !== currentId);
        for (const addr of others) {
          if (addr.isDefault || !addr.isBranchAddress) {
            await triggerUpdateAddress({
              id: addr.id,
              isDefault: false,
              isBranchAddress: true,
            });
          }
        }
      }

      setShowConfirmModal(false);
      setShowSuccessModal(true); // Show SuccessModal
    } catch (err) {
      console.error('[AddressForm] Error:', err);
      setError('Không thể lưu địa chỉ. Vui lòng thử lại.');
      setShowConfirmModal(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icons.BackbuttonProfile width={45} height={45} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Cập nhật địa chỉ' : 'Địa chỉ mới'}</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Địa chỉ</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.formCard}>
          <InputRow
            label={
              isEditing
                ? (isDefault ? "Tên trụ sở chính" : "Tên chi nhánh")
                : (hasAnyAddress ? "Tên chi nhánh" : "Tên trụ sở chính")
            }
            placeholder={
              isEditing
                ? (isDefault ? "Nhập tên trụ sở chính" : "Nhập tên chi nhánh")
                : (hasAnyAddress ? "Nhập tên chi nhánh" : "Nhập tên trụ sở chính")
            }
            value={fullName}
            onChangeText={setFullName}
            maxLength={255}
            icon={<Icons.Name width={20} height={20} />}
          />
          <InputRow
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon={<Icons.Phone width={20} height={20} />}
            maxLength={10}
          />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Địa chỉ</Text>
            {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
            <View style={styles.inputBox}>
              <View style={styles.iconContainer}>
                <Icons.Location width={20} height={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập địa chỉ..."
                placeholderTextColor="#00000080"
                value={query}
                onChangeText={fetchSuggestions}
                maxLength={255}
              />
            </View>

            {results.length > 0 && (
              <View style={styles.resultsContainer}>
                {results.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    style={styles.item}
                    onPress={() => handleSelect(item.place_id, item.description)}
                  >
                    <Text style={styles.itemText}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {results.length === 0 && query.length > 1 && address !== query && (
              <Text style={styles.noResult}>Không có kết quả</Text>
            )}
          </View>
          <InputRow
            label="Địa chỉ chi tiết"
            placeholder="Nhập số nhà, đường,..."
            value={label}
            onChangeText={setLabel}
            icon={<Icons.Locationdetail width={20} height={20} />}
            maxLength={255}
          />

          <ToggleRow
            label="Đặt làm trụ sở chính"
            value={isDefault}
            onValueChange={(val) => {
              if (disableToggle) return;
              setIsDefault(val);
              if (val) setIsBranchAddress(false);
            }}
            disabled={disableToggle}
          />

          <ToggleRow
            label="Địa chỉ chi nhánh"
            value={isBranchAddress}
            onValueChange={(val) => {
              if (disableToggle) return;
              setIsBranchAddress(val);
              if (val) setIsDefault(false);
            }}
            disabled={disableToggle}
          />

          {disableToggle && !isEditing && (
            <Text style={styles.helperText}>Vì đây là địa chỉ đầu tiên, nó sẽ tự động là trụ sở chính và không thể thay đổi.</Text>
          )}
          {disableToggle && isEditing && (
            <Text style={styles.helperText}>Địa chỉ này là trụ sở chính và là địa chỉ duy nhất, không thể bỏ chọn hoặc xóa.</Text>
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Xác nhận cập nhật' : 'Xác nhận thêm mới'}
            </Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn {isEditing ? 'cập nhật' : 'thêm mới'} địa chỉ này?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmSubmit}
              >
                <Text style={styles.modalButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={isEditing ? 'Địa chỉ đã được cập nhật thành công!' : 'Địa chỉ đã được thêm mới thành công!'}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const InputRow = ({ label, icon, ...props }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputBox}>
      <View style={styles.iconContainer}>{icon}</View>
      <TextInput style={styles.input} placeholderTextColor="#00000080" {...props} />
    </View>
  </View>
);

const ToggleRow = ({ label, value, onValueChange, disabled }: { label: string; value: boolean; onValueChange: (val: boolean) => void; disabled?: boolean }) => (
  <View style={styles.toggleRow}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <TouchableOpacity onPress={() => !disabled && onValueChange(!value)} activeOpacity={0.7}>
      <View style={[styles.toggle, value && styles.toggleOn, disabled && styles.toggleDisabled]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60 },
  headerButton: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  scrollContainer: { padding: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  formCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: Colors.black, marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 35, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#E8E8E8' },
  iconContainer: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: Colors.gray },
  resultsContainer: { backgroundColor: Colors.white, borderRadius: 8, marginTop: 8, maxHeight: 200, borderWidth: 1, borderColor: '#E8E8E8', overflow: 'scroll' },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemText: { fontSize: 14, color: Colors.textPrimary },
  noResult: { textAlign: 'center', color: Colors.gray, marginTop: 8, fontSize: 14 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  toggleLabel: { fontSize: 16, color: Colors.textPrimary },
  helperText: { fontSize: 12, color: Colors.gray, marginTop: 8, textAlign: 'center' },
  submitButton: { backgroundColor: Colors.primary, borderRadius: 30, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  toggle: { width: 44, height: 24, borderRadius: 15, backgroundColor: '#E9E9EA', padding: 1, justifyContent: 'center' },
  toggleOn: { backgroundColor: Colors.primary },
  toggleDisabled: { opacity: 0.5 },
  knob: { width: 20, height: 20, borderRadius: 13, backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, elevation: 2 },
  knobOn: { alignSelf: 'flex-end' },
  submitButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  errorText: { fontSize: 14, color: Colors.red, textAlign: 'center', marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  modalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 8 },
  cancelButton: { backgroundColor: Colors.gray },
  confirmButton: { backgroundColor: Colors.primary },
  modalButtonText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});

export default AddressForm;