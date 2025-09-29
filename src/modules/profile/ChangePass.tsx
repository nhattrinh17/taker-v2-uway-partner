import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icons } from '../../assets/icons';
import FailureModal from '../../components/FailureModal';
import Header from '../../components/Header';
import SuccessModal from '../../components/SuccessModal';
import { goBack, navigate, navigationRef } from '../../navigation/utils/navigationUtils';
import { useResetPassword } from '../../services/auth';
import { appStore } from '../../states/app';
import { isSpace, isValidPassword } from '../../ultils/validation';
import { styles } from '../auth/authStyles';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/Avatar';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useChangePassword, useGetInfo } from '../../services/profile';
import { useUserStore } from '../../states/user';

const ChangePass = () => {
  const { setLoading } = appStore(state => state);
  const { user} = useUserStore(state => state);
  const [oldPassword, setPasswordOld] = useState('');
  const [passwordOldError, setPasswordOldError] = useState('');
  const [newPassword, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntryOld, setSecureTextEntryOld] = useState(true);
  const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState(true);
  const { triggerResetPassword } = useResetPassword();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const { triggerChangePassword, errorChangePassword } = useChangePassword();
  const { triggerGetInfo } = useGetInfo();
  const validForm = () => {
    if (newPassword && confirmPassword) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };
  console.log('===>Check User: ', user);
  console.log('Eerrorr', passwordError);
  useEffect(() => {
    validForm();
  }, [newPassword, confirmPassword]);
  const handleForgotPassword = async () => {
    console.log('password', newPassword);
    console.log('confirmPassword', confirmPassword);
    let check = true;
    if (!isValidPassword(newPassword)) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      check = false;
    } else {
      if (!isSpace(newPassword)) {
        check = false;
        setPasswordError('Mật khẩu có ký tự khoảng trắng');
      } else {
        setPasswordError('');
      }
    }
    if (!isValidPassword(oldPassword)) {
      setPasswordOldError('Mật khẩu phải có ít nhất 6 ký tự');
      check = false;
    } else {
      if (!isSpace(oldPassword)) {
        check = false;
        setPasswordOldError('Mật khẩu có ký tự khoảng trắng');
      } else {
        setPasswordOldError('');
      }
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp');
      check = false;
    } else {
      setConfirmPasswordError('');
    }
    if (newPassword === oldPassword) {
      setPasswordError('Mật khẩu mới không được giống với mật khẩu cũ');
      check = false;
    }
    console.log('Us');
    if (!check) {
      return;
    }
    // đổi mật khẩu
    try {
      setLoading(true);
      console.log('===>Check User: ', user);
      const res = await triggerChangePassword({
        id: user.id,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });
      console.log('RESS', res);
      setLoading(false);
      setShowSuccessModal(true);
    } catch (error) {
      setShowFailureModal(true);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!newPassword) {
      setPasswordError('');
    }
  }, [newPassword]);
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Đổi mật khẩu" />

      <View style={styles.content}>
        <View style={{ alignItems: 'center' }}>
          <Avatar />
        </View>

        <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Mật khẩu cũ" value={oldPassword} onChangeText={setPasswordOld} secureTextEntry={secureTextEntryOld} />
          <TouchableOpacity style={styles.deleteButton} onPress={() => setSecureTextEntryOld(!secureTextEntryOld)}>
            {oldPassword && (secureTextEntryOld ? <Icons.Eyesplash /> : <Icons.Eyes />)}
          </TouchableOpacity>
        </View>
        <View style={{ marginVertical: 8 }}>
          {passwordOldError && (
            <View style={styles.errorContainer}>
              <Icons.Warning />
              <Text style={styles.errorText}>{passwordOldError}</Text>
            </View>
          )}
        </View>
        <Text style={styles.inputLabel}>Mật khẩu mới</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Mật khẩu mới" value={newPassword} onChangeText={setPassword} secureTextEntry={secureTextEntry} />
          <TouchableOpacity style={styles.deleteButton} onPress={() => setSecureTextEntry(!secureTextEntry)}>
            {newPassword && (secureTextEntry ? <Icons.Eyesplash /> : <Icons.Eyes />)}
          </TouchableOpacity>
        </View>
        <View style={{ marginVertical: 8 }}>
          {passwordError && (
            <View style={styles.errorContainer}>
              <Icons.Warning />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          )}
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Icons.Warning />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <Text style={styles.inputLabel}>Nhập lại mật khẩu</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={secureTextEntryConfirm} />
          <TouchableOpacity style={styles.deleteButton} onPress={() => setSecureTextEntryConfirm(!secureTextEntryConfirm)}>
            {confirmPassword && (secureTextEntryConfirm ? <Icons.Eyesplash /> : <Icons.Eyes />)}
          </TouchableOpacity>
        </View>
        <View style={{ marginVertical: 8 }}>
          {confirmPasswordError && (
            <View style={styles.errorContainer}>
              <Icons.Warning />
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            </View>
          )}
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Icons.Warning />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity style={[isValid ? styles.loginButton : styles.loginButtonDisabled, { width: '100%' }]} disabled={!isValid} onPress={handleForgotPassword}>
            <Text style={isValid ? styles.loginButtonText : styles.loginButtonTextDisabled}>Cập nhật</Text>
          </TouchableOpacity>
        </View>
        <SuccessModal
          message="Đổi mật khẩu thành công"
          visible={showSuccessModal}
          onClose={() => {
            goBack();
            setShowSuccessModal(false);
          }}
        />
        <FailureModal message="Mật khẩu không hợp lệ" visible={showFailureModal} onClose={() => setShowFailureModal(false)} onContinue={() => setShowFailureModal(false)} />
      </View>
    </SafeAreaView>
  );
};

export default ChangePass;