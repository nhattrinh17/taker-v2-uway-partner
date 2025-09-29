import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import BankSelectionModal from '../../components/BankSelectionModal';
import { useUserStore } from '../../states/user';
import { useGetInfo, useUpdateInfo } from '../../services/profile';
import { showMessageError } from '../../ultils';
import { isValidEmail, isValidPhone } from '../../ultils/validation';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import Avatar from '../../components/Avatar';
import { PartnerProfile, IOperatingHours, IDayOperatingHours } from '../../services/profile/typings';
import DayOperatingRow from '../../components/DayOperatingRow';
import CancelModal from '../../components/CancelModal';
import SuccessModal from '../../components/SuccessModal';
import { goBack } from '../../navigation/utils/navigationUtils';
import InputRow from '../../components/InputRow';

const defaultOperatingHours: IOperatingHours = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
};

// List of valid days to ensure only these are processed
const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Information = () => {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { setUser } = useUserStore();
  const { triggerGetInfo } = useGetInfo();
  const { triggerUpdateInfo } = useUpdateInfo();

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<PartnerProfile>>({
    operatingHours: {} as IOperatingHours,
    type: 'SHOE_CLEANING',
  });
  const [showBankModal, setShowBankModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFocus, setIsFocus] = useState(false);
  const [initialData, setInitialData] = useState<PartnerProfile | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  useEffect(() => {
    if (!isFocused) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await triggerGetInfo();
        const data = res.data;
        if (data) {
          // Xử lý operatingHours raw
          let rawHours: any = data.operatingHours ?? {};
          if (typeof rawHours === 'string') {
            try {
              rawHours = JSON.parse(rawHours);
            } catch (e) {
              rawHours = {};
              console.warn('operatingHours parse failed', e);
            }
          }

          // Chuẩn hóa operatingHours
          const sanitizedOperatingHours: IOperatingHours = { ...defaultOperatingHours };
          validDays.forEach(day => {
            const v = rawHours?.[day];
            if (v == null) {
              sanitizedOperatingHours[day as keyof IOperatingHours] = null;
              return;
            }
            if (typeof v === 'string') {
              try {
                const parsed = JSON.parse(v);
                sanitizedOperatingHours[day as keyof IOperatingHours] = {
                  open: parsed.open ?? null,
                  close: parsed.close ?? null,
                } as IDayOperatingHours;
              } catch {
                const parts = (v as string).split(/[^0-9:]+/).filter(Boolean);
                if (parts.length >= 2) {
                  sanitizedOperatingHours[day as keyof IOperatingHours] = {
                    open: parts[0],
                    close: parts[1],
                  } as IDayOperatingHours;
                } else {
                  sanitizedOperatingHours[day as keyof IOperatingHours] = null;
                }
              }
              return;
            }
            if (typeof v === 'object') {
              const open = (v.open ?? null) as string | null;
              const close = (v.close ?? null) as string | null;
              sanitizedOperatingHours[day as keyof IOperatingHours] = open || close ? { open, close } : null;
              return;
            }
            sanitizedOperatingHours[day as keyof IOperatingHours] = null;
          });

          // Xử lý activeSince - chuyển từ timestamp thành năm (number)
          let activeSinceYear: number | undefined = undefined;
          if (data.activeSince) {
            if (typeof data.activeSince === 'number') {
              activeSinceYear = new Date(data.activeSince).getFullYear();
            } else if (typeof data.activeSince === 'string') {
              const parsed = parseInt(data.activeSince);
              if (!isNaN(parsed)) {
                // Nếu là năm (4 chữ số)
                if (parsed >= 1990 && parsed <= new Date().getFullYear()) {
                  activeSinceYear = parsed;
                } else {
                  // Nếu là timestamp
                  activeSinceYear = new Date(parsed).getFullYear();
                }
              }
            }
          }

          const updatedData: PartnerProfile = {
            ...data,
            name: data.fullName || data.name || '',
            operatingHours: sanitizedOperatingHours,
            type: data.type ?? 'SHOE_CLEANING',
            activeSince: activeSinceYear,
          };

          setFormData(updatedData);
          setInitialData(updatedData);
          setUser(updatedData);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isFocused, setUser, triggerGetInfo]);

  const hasChanges = () => {
    if (!initialData || !formData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  // 🔹 Update field text
  const handleInputChange = (field: keyof PartnerProfile, value: string) => {
    if (field === 'activeSince') {
      // Chỉ cho phép nhập số và giới hạn 4 chữ số
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 4) {
        const yearNumber = numericValue ? parseInt(numericValue) : undefined;
        setFormData((prev: any) => ({ ...prev, [field]: yearNumber }));
      }
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🔹 Gửi API update
  const handleUpdate = async () => {
    let newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.name?.trim()) {
      newErrors.name = 'Họ và tên không được để trống';
      isValid = false;
    }
    if (formData.phone?.trim() && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không đúng định dạng';
      isValid = false;
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email không được để trống';
      isValid = false;
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = 'Email không đúng định dạng';
      isValid = false;
    }

    // Validate activeSince (năm) - phải từ 1990 đến năm hiện tại
    if (!formData.activeSince) {
      newErrors.activeSince = 'Năm hoạt động không được để trống';
      isValid = false;
    } else {
      const currentYear = new Date().getFullYear();
      if (
        typeof formData.activeSince !== 'number' ||
        isNaN(formData.activeSince) ||
        formData.activeSince < 1990 ||
        formData.activeSince > currentYear
      ) {
        newErrors.activeSince = `Năm hoạt động phải từ 1990 đến ${currentYear}`;
        isValid = false;
      }
    }

    // Validate operating hours - kiểm tra tất cả các ngày
    const hasInvalidOperatingHours = validDays.some(day => {
      const dayHours = formData.operatingHours?.[day];
      return !dayHours || !dayHours.open || !dayHours.close;
    });

    if (hasInvalidOperatingHours) {
      newErrors.operatingHours = 'Vui lòng nhập đầy đủ giờ mở cửa và đóng cửa';
      isValid = false;
    }

    const hasAnyBankField = formData.bankName || formData.bankAccountName || formData.bankAccountNumber;
    if (hasAnyBankField && (!formData.bankName || !formData.bankAccountName?.trim() || !formData.bankAccountNumber?.trim())) {
      newErrors.bank = 'Vui lòng điền đầy đủ thông tin ngân hàng';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    setIsLoading(true);
    const payload: Partial<PartnerProfile> = {
      name: formData.name ?? '',
      email: formData.email,
      phone: formData.phone,
      activeSince: formData.activeSince ? new Date(formData.activeSince, 0, 1).getTime() : undefined,
      bankName: formData.bankName,
      bankAccountNumber: formData.bankAccountNumber,
      bankAccountName: formData.bankAccountName,
      avatar: formData.avatar,
      operatingHours: formData.operatingHours,
      type: formData.type,
    };

    try {
      console.log('==>', payload);
      await triggerUpdateInfo(payload);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.log('==>', error);
      showMessageError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !formData.id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (hasChanges()) {
              setShowConfirmModal(true);
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Icons.BackbuttonProfile width={45} height={45} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 45 }} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <Avatar />
        </View>

        {/* Inputs */}
        <InputRow
          label="Họ và tên"
          value={formData.name}
          onChangeText={text => handleInputChange('name', text)}
          error={errors.name}
          icon={<Icons.Name width={20} height={20} />}
        />
        <InputRow
          label="Số điện thoại"
          value={formData.phone}
          onChangeText={text => handleInputChange('phone', text.replace(/\D/g, ''))}
          error={errors.phone}
          icon={<Icons.Phone width={20} height={20} />}
          keyboardType="numeric"
          maxLength={10}
          editable={false}
        />
        <InputRow
          label="Email"
          value={formData.email}
          onChangeText={text => handleInputChange('email', text)}
          error={errors.email}
          icon={<Icons.Email width={20} height={20} />}
        />
        <InputRow
          label="Năm hoạt động"
          value={formData.activeSince?.toString() || ''}
          onChangeText={text => handleInputChange('activeSince', text)}
          error={errors.activeSince}
          icon={<Icons.DateTime width={20} height={20} />}
          keyboardType="numeric"
          maxLength={4}
          placeholder="VD: 2023"
        />

        {/* Bank */}
        <Text style={styles.sectionTitle}>Ngân hàng</Text>
        <TouchableOpacity style={styles.bankSelector} onPress={() => setShowBankModal(true)}>
          <View style={styles.inputIconContainer}>
            <Icons.Bank width={20} height={20} />
          </View>
          <Text style={[styles.bankSelectorText, !formData.bankName && styles.placeholderText]}>
            {formData.bankName || 'Chọn ngân hàng'}
          </Text>
        </TouchableOpacity>
        <InputRow
          label="Số tài khoản"
          value={formData.bankAccountNumber}
          onChangeText={text => handleInputChange('bankAccountNumber', text)}
          keyboardType="default"
          icon={<Icons.STK width={20} height={20} />}
        />
        <InputRow
          label="Tên tài khoản"
          value={formData.bankAccountName}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChangeText={text => handleInputChange('bankAccountName', text.toUpperCase())}
          icon={<Icons.Name width={20} height={20} />}
        />

        {isFocus && !!formData.bankAccountName && (
          <Text style={{ marginTop: 6, fontSize: 12, color: 'red' }}>
            *Thông tin tài khoản ngân hàng được cung cấp do khách hàng chịu trách nhiệm
          </Text>
        )}
        {errors.bank && <Text style={styles.errorText}>{errors.bank}</Text>}

        {/* Operating hours */}
        <Text style={styles.sectionTitle}>Giờ hoạt động</Text>
        {validDays.map(day => (
          <DayOperatingRow
            key={day}
            label={day.charAt(0).toUpperCase() + day.slice(1)}
            value={formData.operatingHours?.[day] || null}
            onChange={(val: any) =>
              setFormData(prev => ({
                ...prev,
                operatingHours: {
                  ...(prev.operatingHours ?? {}),
                  [day]: val,
                },
              }))
            }
          />
        ))}
        {errors.operatingHours && <Text style={styles.errorText}>{errors.operatingHours}</Text>}

        {/* Update button */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => setShowUpdateConfirm(true)}
        >
          <Text style={styles.updateButtonText}>Cập nhật</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <BankSelectionModal
        isVisible={showBankModal}
        onClose={() => setShowBankModal(false)}
        selectedBankName={formData.bankName}
        onSelectBank={bank => {
          setFormData(prev => ({ ...prev, bankName: bank ? bank.name : '' }));
        }}
      />
      <CancelModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onContinue={() => {
          setShowConfirmModal(false);
          navigation.goBack();
        }}
        message="Thông tin chưa được lưu"
        textBtn="Tiếp tục"
      />
      <CancelModal
        visible={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onContinue={() => {
          setShowUpdateConfirm(false);
          handleUpdate();
        }}
        message="Bạn có chắc chắn muốn cập nhật thông tin?"
        textBtn="Xác nhận"
      />
      <SuccessModal
        visible={showSuccessModal}
        title="Thành công"
        message="Cập nhật thông tin thành công"
        onClose={() => {
          setShowSuccessModal(false);
          goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  backButton: { justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginVertical: 40 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  cameraIcon: { position: 'absolute', bottom: 5, right: '35%', padding: 1, borderRadius: 20 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: '#000000B2', marginBottom: 8, fontWeight: '500' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    backgroundColor: Colors.background,
    borderColor: '#0000001A',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 11,
  },
  inputIconContainer: { marginRight: 12 },
  input: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  updateButton: {
    backgroundColor: Colors.blue,
    borderRadius: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  updateButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  modal: { justifyContent: 'center', margin: 20 },
  contentModal: { backgroundColor: 'white', borderRadius: 16, padding: 30, alignItems: 'center' },
  successText: { fontWeight: '600', marginTop: 12, fontSize: 16, textAlign: 'center' },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    backgroundColor: Colors.background,
    borderColor: '#0000001A',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  bankSelectorText: { fontSize: 14, color: Colors.textPrimary, flex: 1 },
  placeholderText: { color: '#999' },
  errorText: { color: 'red', fontSize: 12, marginTop: 5, marginLeft: 5 },
  sectionTitle: { fontSize: 14, marginBottom: 12, color: '#000000B2' },
});

export default Information;