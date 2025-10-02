import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../../assets/Images';
import { Icons } from '../../assets';
import { Colors } from '../../assets/Colors';
import { sx } from './authStyles';
import { isValidVietnamesePhone } from '../../ultils/validation';
import { useForgotPassword } from '../../services/auth';
import { appStore } from '../../states/app';
import { navigationRef } from '../../navigation/utils/navigationUtils';
import { goBack, navigate, replace } from '../../navigation/utils/navigationUtils';
import { Screen } from 'react-native-screens';

const ForgotPassword = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState('');
  const { setLoading } = appStore(state => state);
  const { triggerForgotPassword } = useForgotPassword();

  // Real-time phone number validation
  useEffect(() => {
    if (phoneNumber.length > 0) {
      if (!isValidVietnamesePhone(phoneNumber)) {
        setPhoneError('Số điện thoại không hợp lệ');
        setError(''); // Clear server-side error when phone number changes
      } else {
        setPhoneError('');
        setError(''); // Clear server-side error when phone number is valid
      }
    } else {
      setPhoneError('');
      setError('');
    }
  }, [phoneNumber]);

  const handleForgotPassword = async () => {
    setError('');
    setPhoneError(''); // Clear phoneError to prevent duplicate error messages

    if (!isValidVietnamesePhone(phoneNumber)) {
      setPhoneError('Số điện thoại không hợp lệ');
      return;
    }

    try {
      const res = await triggerForgotPassword({ phone: phoneNumber });
      console.log('reponse', res)
      if (res.type === 'success') {
        setLoading(false);
        navigationRef.navigate('Otp', { phoneNumber: phoneNumber, type: 'existed' });
      } else {
        setLoading(false);
      }
    } catch (error: Error | any) {
      setError('');
      console.log('🚀 ~ handleForgotPassword ~ error:', error.data.message);
      console.log('🚀 ~ error:', error);
      const errorMessage = error.data.message;
      switch (errorMessage) {
        case 'user_not_found':
          setError('Số điện thoại không tồn tại');
          break;
        case 'otp_already_sent':
          setError('Mã OTP đã được gửi. Vui lòng kiểm tra tin nhắn.');
          navigationRef.navigate('Otp', { phoneNumber: phoneNumber, type: 'existed' });
          break;
        case '{"message":"step_invalid","step":"OTP"}':
          setError('');
          navigationRef.navigate('Otp', { phoneNumber, type: 'existed' });
          break;
        case 'otp_limit_exceeded':
          setError('Bạn đã gửi yêu cầu OTP quá nhiều lần.');
          break;
        default:
          setError('Đã có lỗi xảy ra, vui lòng thử lại.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={[sx.wrap, styles.container]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => replace('AuthStack', {screen: 'Login'})} style={styles.backButton}>
                {Icons.BackbuttonProfile ? (
                  <Icons.BackbuttonProfile width={45} height={45} />
                ) : (
                  <Text style={styles.backButtonText}>‹</Text>
                )}
              </TouchableOpacity>
            </View>

            <Image source={Images.LogoApp} style={[sx.logo, styles.logo]} />
            <Text style={styles.title}>Quên mật khẩu</Text>

            <View style={styles.form}>
              <Text style={sx.label}>Số điện thoại</Text>
              <View style={styles.inputRow}>
                {Icons.Phone ? <Icons.Phone width={20} height={20} /> : null}
                <TextInput
                  style={sx.input}
                  placeholder=""
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.gray}
                  maxLength={10}
                />
              </View>
              {!!phoneError && <Text style={sx.errorText}>{phoneError}</Text>}
              {!!error && <Text style={sx.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[sx.loginBtn, !isValidVietnamesePhone(phoneNumber) && sx.loginBtnDisabled, styles.sendButton]}
                disabled={!isValidVietnamesePhone(phoneNumber)}
                onPress={handleForgotPassword}
              >
                <Text style={[sx.loginBtnText, !isValidVietnamesePhone(phoneNumber) && sx.loginBtnTextDisabled]}>Gửi</Text>
              </TouchableOpacity>

              <View style={sx.dividerWrap}>
                <View style={sx.divider} />
                <Text style={sx.dividerText}>Hoặc</Text>
                <View style={sx.divider} />
              </View>

              <View style={sx.socialRow}>
                <TouchableOpacity>
                  {Icons.Google ? <Icons.Google width={60} height={60} /> : null}
                </TouchableOpacity>
                <TouchableOpacity>
                  {Icons.Facebook ? <Icons.Facebook width={60} height={60} /> : null}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F8FF',
  },
  container: {
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {marginTop: 30 },
  form: { marginTop: 3 },
  backButtonText: {
    fontSize: 30,
    color: Colors.textPrimary,
  },
  logo: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '400',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  sendButton: {
    marginTop: 30,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundlogin,
    borderWidth: 1.5,
    borderColor: '#0B96DF99',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 45,
  },
});

export default ForgotPassword;