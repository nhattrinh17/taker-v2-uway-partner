import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { RootNavigatorParamList } from '../../navigation/typings';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { appStore } from '../../states/app';
import { useResetPassword } from '../../services/auth';
import SuccessModal from '../../components/SuccessModal';
import { navigationRef } from '../../navigation/utils/navigationUtils';

// ✅ Định nghĩa kiểu dữ liệu cho props của InputRow
interface InputRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry: boolean;
  onToggleSecure: () => void;
  error?: string;
}

// Component InputRow để tái sử dụng
const InputRow = ({ label, value, onChangeText, secureTextEntry, onToggleSecure, error }: InputRowProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputBox}>
      <View style={styles.iconContainer}>
        <Icons.Password width={20} height={20} />
      </View>
      <TextInput
        style={styles.input}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        placeholder=""
        placeholderTextColor={Colors.textSecondary}
      />
      <TouchableOpacity onPress={onToggleSecure} style={styles.iconContainer}>
        {secureTextEntry
          ? <Icons.Eyes width={20} height={20} />
          : <Icons.Eyesplash width={20} height={20} />
        }
      </TouchableOpacity>
    </View>
    {/* Hiển thị lỗi ngay bên dưới input */}
    {!!error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

type Props = {
  route: RouteProp<RootNavigatorParamList, 'ChangePassword'>;
};

const ChangePassword = (props: Props) => {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const { setLoading } = appStore(state => state);
  const { phone } = props.route.params || {};
  const [ok, setOk] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const { triggerResetPassword } = useResetPassword();
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [message, setMessage] = useState('');

  const validForm = () => {
    setIsValid(password !== '' && confirmPassword !== '');
  };

  useEffect(() => {
    validForm();
  }, [password, confirmPassword]);
  const handleUpdatePassword = async () => {
    setPasswordError('');
    setConfirmPasswordError('');

    if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password.includes(' ')) {
      setPasswordError('Mật khẩu không được chứa khoảng trắng');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp');
      return;
    }
    try {
      setLoading(true);
      const res = await triggerResetPassword({
        phone: phone,
        password: password,
      });
      if (res.type === 'success') {
        setOk(true);
      }
    } catch (error: any) {
      setShowFailureModal(true);
      setMessageError(error.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    switch (messageError) {
      case 'password_same':
        setMessage('Mật khẩu mới trùng với mật khẩu cũ');
        break;
      default:
        setMessage('Mật khẩu không hợp lệ');
        break;
    }
  }, [messageError]);

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icons.BackbuttonProfile width={45} height={45} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 45 }} />
      </View>

      <View style={styles.container}>
        {/* SỬA LỖI 2: Kết nối state với InputRow */}
        <InputRow
          label="Mật khẩu mới"
          secureTextEntry={secureNew}
          onToggleSecure={() => setSecureNew(v => !v)}
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />
        <InputRow
          label="Xác nhận mật khẩu mới"
          secureTextEntry={secureConfirm}
          onToggleSecure={() => setSecureConfirm(v => !v)}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={confirmPasswordError}
        />

        {/* SỬA LỖI 3: Thêm sự kiện onPress và disabled */}
        <TouchableOpacity 
          style={[styles.updateButton, !isValid && styles.buttonDisabled]} 
          onPress={handleUpdatePassword}
          disabled={!isValid}
        >
          <Text style={styles.updateButtonText}>Cập nhật</Text>
        </TouchableOpacity>
      </View>

      <SuccessModal
        visible={ok}
        onClose={() => {
          setOk(false);
          navigationRef.navigate('Login');   
        }}
        icon={<Icons.Success width={60} height={60} />} 
        title="Đăng ký thành công"
        message="Vui lòng chờ, bạn sẽ được chuyển hướng đến trang đăng nhập"
        autoCloseMs={2000}   
      />
       <SuccessModal
        visible={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        // Giả sử bạn có icon cho trường hợp thất bại, nếu không có thể bỏ qua
        icon={<Icons.Success width={60} height={60} />} 
        title="Đã xảy ra lỗi"
        message={message} // `message` sẽ được lấy từ state
        primaryText="Thử lại"
        onPrimaryPress={() => setShowFailureModal(false)} // Nút này chỉ cần đóng modal
      />
    </View>
  
  );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      height: 60,
    },
    backButton: {
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
      paddingHorizontal: 24,
      paddingTop: 40,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginBottom: 8,
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white,
      borderRadius: 30,
      paddingHorizontal: 15,
      height: 50,
      borderColor: Colors.border,
      borderWidth: 1,
    },
    iconContainer: {
      paddingHorizontal: 5,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: Colors.textPrimary,
      marginLeft: 5,
    },
    updateButton: {
      backgroundColor: Colors.primary,
      borderRadius: 30,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
    },
    updateButtonText: {
      color: Colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonDisabled: {
      backgroundColor: Colors.border, 
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 16,
    }
});
  
export default ChangePassword;