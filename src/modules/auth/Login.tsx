import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Images } from '../../assets/Images';
import { Icons } from '../../assets';
import { authorize } from 'react-native-app-auth';
import { LoginManager, AccessToken, Profile } from 'react-native-fbsdk-next';
import { Colors } from '../../assets/Colors';
import { appStore } from '../../states/app';
import { sx } from './authStyles';
import { navigationRef, replace } from '../../navigation/utils/navigationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../../states/user';
import { SafeAreaView } from 'react-native-safe-area-context';
import SuccessModal from '../../components/SuccessModal';
import { Fonts } from '../../assets/Fonts';
import { navigate } from '../../navigation/utils/navigationUtils';
import { isValidVietnamesePhone, isValidPassword } from '../../ultils/validation';
import { useLoginPhone } from '../../services/auth';

const Login = () => {
  const { setLoading } = appStore(state => state);
  const { setToken, setUser } = useUserStore(state => state);
  const [isValid, setIsValid] = useState(false);
  const { triggerLoginPhone } = useLoginPhone();
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [remember, setRemember] = useState(true);
  const [ok, setOk] = useState(false);

  // Thêm ref để prevent double submit
  const isSubmitting = useRef(false);
  const navLock = useRef(false);

  const validForm = () => {
    if (phoneNumber === '' || password === '') {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  useEffect(() => {
    validForm();
  }, [phoneNumber, password]);

  const config = {
    issuer: 'https://accounts.google.com',
    clientId: '133817269160-jn8i430sqtn8loa8mvfdt773h97i2tgg.apps.googleusercontent.com',
    redirectUrl: 'com.ximiapp:/oauth2redirect/google',
    scopes: ['openid', 'profile', 'email'],
  };

  useFocusEffect(
    useCallback(() => {
      // Reset lỗi và trạng thái submit
      setError('');
      setPhoneError('');
      setPasswordError('');
      isSubmitting.current = false;
      navLock.current = false;
    }, [])
  );

  const handleLoginPhone = async () => {
    // Prevent double submit
    if (isSubmitting.current) {
      console.log('⚠️ Login đang được xử lý, bỏ qua request mới');
      return;
    }

    setPhoneError('');
    setPasswordError('');
    setError('');

    if (!isValidVietnamesePhone(phoneNumber)) {
      setPhoneError('Số điện thoại không hợp lệ');
      return;
    }
    if (!isValidPassword(password) || /\s/.test(password)) {
      setPasswordError('Mật khẩu tối thiểu 6 ký tự, không có khoảng trắng');
      return;
    }

    try {
      isSubmitting.current = true;
      setLoading(true);

      const res = await triggerLoginPhone({ phone: phoneNumber, password });
      setToken(res.data.accessToken);
      setUser(res.data.user);

      if (remember) {
        await AsyncStorage.setItem('savedPhone', phoneNumber);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedPhone');
        await AsyncStorage.removeItem('savedPassword');
      }

      console.log('🚀 ~ Login ~ res:', res);
      console.log('✅ Đăng nhập thành công, điều hướng sang BottomStack');
      setOk(true);
    } catch (e: any) {
      console.log('==>', e.data?.message);
      switch (e?.data?.message) {
        case 'phone_or_password_wrong':
          setError('Sai số điện thoại hoặc mật khẩu');
          break;
        case '{"message":"phone_already_exists_or_not_match","step":"COMPLETED","status":"BLOCKED"}':
          setError('Tài khoản đã bị khoá, vui lòng liên hệ admin');
          break;
        case '{"message":"phone_already_exists_or_not_match","step":"REGISTER_INFO_SUCCESS","status":"PENDING"}':
          setError('Vui lòng đăng ký và hoàn thành bước xác thực OTP');
          break;
        default:
          setError('Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  useEffect(() => {
    (async () => {
      const savedRemember = await AsyncStorage.getItem('rememberLogin');
      if (savedRemember !== null) setRemember(JSON.parse(savedRemember));

      if (JSON.parse(savedRemember ?? 'false')) {
        const savedPhone = await AsyncStorage.getItem('savedPhone');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        if (savedPhone) setPhoneNumber(savedPhone);
        if (savedPassword) setPassword(savedPassword);
      }
    })();
  }, []);

  const toggleRemember = async () => {
    const newVal = !remember;
    setRemember(newVal);
    await AsyncStorage.setItem('rememberLogin', JSON.stringify(newVal));
    if (!newVal) {
      await AsyncStorage.removeItem('savedPhone');
      await AsyncStorage.removeItem('savedPassword');
    }
  };

  useEffect(() => {
    setIsValid(
      isValidVietnamesePhone(phoneNumber) &&
      isValidPassword(password) &&
      !/\s/.test(password)
    );
  }, [phoneNumber, password]);

  useEffect(() => {
    if (!phoneNumber) {
      setPhoneError('');
    }
    if (!password) {
      setPasswordError('');
    }
    setError('');
  }, [phoneNumber, password]);

  const signInWithGoogle = async () => {
    // ... validate / call API
    setOk(true); // mở popup
  };

  const loginWithFacebook = async () => {
    // ... validate / call API
    setOk(true); // mở popup
  };

  const handleSuccessModalClose = () => {
    if (navLock.current) return;
    navLock.current = true;
    setOk(false);
    replace('BottomStack');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[sx.screen, { backgroundColor: Colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[sx.scrollContent, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        style={sx.scrollView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={[sx.wrap, { backgroundColor: Colors.background }]}>
            {/* Logo */}
            <Image source={Images.LogoApp} style={sx.logo} />

            {/* Segmented: Đăng nhập / Đăng ký */}
            <View style={sx.segment}>
              <TouchableOpacity style={[sx.segmentBtn, sx.segmentBtnActive]}>
                <Text style={sx.segmentTextActive}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity style={sx.segmentBtn} onPress={() => navigate('SignUp')}>
                <Text style={sx.segmentText}>Đăng ký</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={sx.form}>
              <Text style={sx.label}>Số điện thoại</Text>
              <View style={sx.inputRow}>
                {Icons.Phone ? <Icons.Phone width={20} height={20} /> : null}
                <TextInput
                  style={sx.input}
                  placeholder="Nhập số điện thoại"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    const onlyNumbers = text.replace(/[^0-9]/g, '');
                    setPhoneNumber(onlyNumbers);
                  }}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.gray}
                  maxLength={10}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              {!!phoneError && <Text style={sx.errorText}>{phoneError}</Text>}

              <Text style={[sx.label, { marginTop: 12 }]}>Mật khẩu</Text>
              <View style={sx.inputRow}>
                {Icons.Password ? <Icons.Password width={20} height={20} /> : null}
                <TextInput
                  style={sx.input}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureTextEntry}
                  placeholderTextColor={Colors.gray}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (isValid && !isSubmitting.current) {
                      handleLoginPhone();
                    }
                  }}
                />
                <TouchableOpacity
                  style={sx.eyeBtn}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                >
                  {secureTextEntry ? <Icons.Eyesplash /> : <Icons.Eyes />}
                </TouchableOpacity>
              </View>
              {!!passwordError && <Text style={sx.errorText}>{passwordError}</Text>}

              {/* Nhớ tài khoản / Quên mật khẩu? */}
              <View style={sx.rowBetween}>
                <View style={sx.rememberRow}>
                  <TouchableOpacity
                    onPress={toggleRemember}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    style={sx.checkboxWrap}
                    activeOpacity={0.8}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: remember }}
                  >
                    {remember ? (
                      <Icons.Rememberpass width={18} height={18} fill={Colors.blue} />
                    ) : (
                      <View style={sx.checkbox} />
                    )}
                  </TouchableOpacity>
                  <Text selectable={false} style={sx.rememberText}>
                    Nhớ tài khoản
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigationRef.navigate('ForgotPassword')}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text selectable={false} style={sx.forgot}>
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Lỗi chung */}
              {!!error && <Text style={[sx.errorText, { marginTop: 8 }]}>{error}</Text>}

              {/* Nút Đăng nhập */}
              <TouchableOpacity
                style={[sx.loginBtn, (!isValid || isSubmitting.current) && sx.loginBtnDisabled]}
                disabled={!isValid || isSubmitting.current}
                onPress={handleLoginPhone}
              >
                <Text
                  style={[
                    sx.loginBtnText,
                    (!isValid || isSubmitting.current) && sx.loginBtnTextDisabled,
                  ]}
                >
                  Đăng nhập
                </Text>
              </TouchableOpacity>

              {/* Divider Hoặc */}
              <View style={sx.dividerWrap}>
                <View style={sx.divider} />
                <Text style={sx.dividerText}>Hoặc</Text>
                <View style={sx.divider} />
              </View>

              {/* Google / Facebook */}
              <View style={sx.socialRow}>
                <TouchableOpacity onPress={signInWithGoogle}>
                  {Icons.Google ? <Icons.Google width={60} height={60} /> : null}
                </TouchableOpacity>
                <TouchableOpacity onPress={loginWithFacebook}>
                  {Icons.Facebook ? <Icons.Facebook width={60} height={60} /> : null}
                </TouchableOpacity>
              </View>
            </View>

            <SuccessModal
              visible={ok}
              onClose={handleSuccessModalClose}
              icon={<Icons.Success width={60} height={60} />}
              title="Đăng nhập thành công"
              message="Vui lòng bấm 'Tiếp tục' để chuyển đến trang chủ"
              primaryText="Tiếp tục"
              onPrimaryPress={handleSuccessModalClose}
              autoCloseMs={1500}
            />
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;