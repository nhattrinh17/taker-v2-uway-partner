import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TextInput, TouchableOpacity, Pressable, StatusBar, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Images } from '../../assets/Images';
import { Icons } from '../../assets';
import { Fonts } from '../../assets/Fonts';
import { isValidVietnamesePhone, isValidPassword } from '../../ultils/validation';
import { useSignUp } from '../../services/auth';
import { useUserStore } from '../../states/user';
import { appStore } from '../../states/app';
import { sx } from './authStyles';
import { navigationRef, navigate } from '../../navigation/utils/navigationUtils';
import { Colors } from '../../assets/Colors';
import SuccessModal from '../../components/SuccessModal';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootNavigatorParamList } from '../../navigation/typings';

type SignUpRouteProp = RouteProp<RootNavigatorParamList, 'SignUp'>;

const SignUp = () => {
  const { setLoading } = appStore(state => state);
  const { setToken, setUser } = useUserStore(state => state);
  const { triggerSignUp } = useSignUp();
  const route = useRoute<SignUpRouteProp>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [name, setName] = useState(route.params?.name || '');
  const [email, setEmail] = useState(route.params?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(route.params?.phoneNumber || '');
  const [password, setPassword] = useState(route.params?.password || '');
  const [confirmPassword, setConfirmPassword] = useState(route.params?.confirmPassword || '');
  const [referralCode, setReferralCode] = useState(route.params?.referralCode || '');
  const [typeService, setTypeService] = useState(route.params?.typeService || 'SHOE_CLEANING');
  const [checked, setChecked] = useState(route.params?.checked || false);
  const [isValid, setIsValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntry2, setSecureTextEntry2] = useState(true);
  const [ok, setOk] = useState(false);

  // Kiểm tra lỗi theo thời gian thực
  useEffect(() => {
    setPhoneError('');
    if (phoneNumber && !isValidVietnamesePhone(phoneNumber)) {
      setPhoneError('Số điện thoại không hợp lệ');
    }
  }, [phoneNumber]);

  useEffect(() => {
    setPasswordError('');
    if (password && (!isValidPassword(password) || /\s/.test(password))) {
      setPasswordError('Mật khẩu tối thiểu 6 ký tự, không có khoảng trắng');
    } else if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError('Mật khẩu nhập lại không khớp');
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    setIsValid(
      !!name &&
      isValidVietnamesePhone(phoneNumber) &&
      isValidPassword(password) &&
      password === confirmPassword &&
      checked
    );
  }, [name, phoneNumber, password, confirmPassword, checked]);

  const mapServerMsg = (msg?: string) => {
    if (!msg) return 'Có lỗi xảy ra, vui lòng thử lại';
    if (msg.includes('duplicate entry')) return 'Số điện thoại đã tồn tại';
    switch (msg) {
      case 'phone_already_exists': return 'Số điện thoại đã tồn tại, vui lòng thực hiện đăng nhập';
      case 'phone_number_invalid': return 'Số điện thoại không hợp lệ';
      case 'referral_code_not_found': return 'Mã giới thiệu không hợp lệ';
      case 'action_invalid': return 'Hành động không hợp lệ';
      default: return msg;
    }
  };

  const handleSignUp = async () => {
    setPhoneError('');
    setPasswordError('');
    setError('');

    if (!name) {
      setError('Vui lòng nhập họ và tên');
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (!isValidVietnamesePhone(phoneNumber)) {
      setPhoneError('Số điện thoại không hợp lệ');
      scrollViewRef.current?.scrollTo({ y: 100, animated: true });
      return;
    }
    if (!isValidPassword(password) || /\s/.test(password)) {
      setPasswordError('Mật khẩu tối thiểu 6 ký tự, không có khoảng trắng');
      scrollViewRef.current?.scrollTo({ y: 200, animated: true });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu nhập lại không khớp');
      scrollViewRef.current?.scrollTo({ y: 250, animated: true });
      return;
    }
    if (!checked) {
      setError('Vui lòng đồng ý với điều khoản và chính sách');
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
      return;
    }

    try {
      setLoading(true);
      const res = await triggerSignUp({
        name,
        password,
        address: '',
        phone: phoneNumber,
        email,
        type: typeService,
        referralCode: referralCode || undefined,
      });
      console.log("[SignUp] ✅ Đăng ký thành công, phản hồi từ server:", res);
      navigate('Otp', {
        id: res.data.id,
        phoneNumber,
        name,
        email,
        password,
        confirmPassword,
        referralCode,
        typeService,
        checked,
        type: 'existed',
      });
    } catch (err: any) {
      console.log("[SignUp] Lỗi:", err);
      const raw = err?.data?.message;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed?.step === 'REGISTER_INFO_SUCCESS' && parsed?.status === 'PENDING') {
          console.log("[SignUp] ↪️ Tài khoản đã tồn tại, chuyển sang OTP.");
          return navigate('Otp', {
            id: phoneNumber,
            phoneNumber,
            type: 'existed',
            name,
            email,
            password,
            confirmPassword,
            referralCode,
            typeService,
            checked,
          });
        }
        if (parsed?.step === 'REGISTER_INFO_SUCCESS' && parsed?.id) {
          return navigate('Otp', {
            id: parsed.id,
            phoneNumber,
            type: 'existed',
            name,
            email,
            password,
            confirmPassword,
            referralCode,
            typeService,
            checked,
          });
        }
        setError(mapServerMsg(parsed?.message ?? raw));
        scrollViewRef.current?.scrollTo({ y: 350, animated: true });
      } catch {
        setError(mapServerMsg(raw));
        scrollViewRef.current?.scrollTo({ y: 350, animated: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const openTOS = () => { /* TODO: navigate('WebView', { url: 'https://...' }) */ };
  const openPolicy = () => { /* TODO: navigate('WebView', { url: 'https://...' }) */ };

  const signInWithGoogle = async () => {
    setOk(true); // Giả lập thành công, thay bằng logic thực tế
  };

  const loginWithFacebook = async () => {
    setOk(true); // Giả lập thành công, thay bằng logic thực tế
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={sx.screen}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={sx.wrap}>
           
            <Image source={Images.LogoApp} style={sx.logo} />

            <View style={sx.segment}>
              <TouchableOpacity style={sx.segmentBtn} onPress={() => navigationRef.navigate('Login')}>
                <Text style={sx.segmentText}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[sx.segmentBtn, sx.segmentBtnActive]}>
                <Text style={sx.segmentTextActive}>Đăng ký</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={sx.form}>
              {/* Họ và tên */}
              <Text style={sx.label}>Họ và tên</Text>
              <View style={sx.inputRow}>
                {Icons.Name ? <Icons.Name width={20} height={20} /> : null}
                <TextInput
                  style={sx.input}
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.gray}
                />
              </View>
              {!!error && error.includes('họ và tên') && <Text style={sx.errorText}>{error}</Text>}

              {/* Số điện thoại */}
              <Text style={[sx.label, { marginTop: 12 }]}>Số điện thoại</Text>
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
                />
              </View>
              {!!phoneError && <Text style={sx.errorText}>{phoneError}</Text>}

              {/* Mật khẩu */}
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
                />
                <TouchableOpacity style={sx.eyeBtn} onPress={() => setSecureTextEntry(v => !v)}>
                  {secureTextEntry ? <Icons.Eyesplash /> : <Icons.Eyes />}
                </TouchableOpacity>
              </View>

              {/* Xác nhận mật khẩu */}
              <Text style={[sx.label, { marginTop: 12 }]}>Xác nhận mật khẩu</Text>
              <View style={sx.inputRow}>
                {Icons.Password ? <Icons.Password width={20} height={20} /> : null}
                <TextInput
                  style={sx.input}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={secureTextEntry2}
                  placeholderTextColor={Colors.gray}
                />
                <TouchableOpacity style={sx.eyeBtn} onPress={() => setSecureTextEntry2(v2 => !v2)}>
                  {secureTextEntry2 ? <Icons.Eyesplash /> : <Icons.Eyes />}
                </TouchableOpacity>
              </View>
              {!!passwordError && <Text style={sx.errorText}>{passwordError}</Text>}

              {/* Mã giới thiệu */}
              <Text style={[sx.label, { marginTop: 12 }]}>Mã giới thiệu</Text>
              <View style={sx.inputRow}>
                {Icons.Introduce ? <Icons.Introduce width={20} height={20} /> : null}
                <TextInput
                  style={sx.input}
                  placeholder="Nhập mã giới thiệu"
                  value={referralCode}
                  onChangeText={setReferralCode}
                  placeholderTextColor={Colors.gray}
                />
              </View>

              {/* Loại dịch vụ */}
              <Text style={[sx.label, { marginTop: 12 }]}>Loại dịch vụ</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {[
                  { label: 'Shoe Cleaning', value: 'SHOE_CLEANING' },
                  { label: 'Other', value: 'OTHER' },
                ].map(opt => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTypeService(opt.value)}
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: 16,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: typeService === opt.value ? Colors.blue : Colors.gray,
                        borderRadius: 8,
                        backgroundColor: typeService === opt.value ? Colors.blue + '20' : 'transparent',
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: typeService === opt.value ? Colors.blue : Colors.gray,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 6,
                      }}
                    >
                      {typeService === opt.value && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: Colors.blue,
                          }}
                        />
                      )}
                    </View>
                    <Text style={{ color: Colors.black }}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Đồng ý điều khoản */}
              <View style={[sx.rowBetween, { justifyContent: 'flex-start', marginTop: 14 }]}>
                <TouchableOpacity
                  onPress={() => setChecked(v => !v)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={sx.checkboxWrap}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                >
                  {checked
                    ? <Icons.Rememberpass width={18} height={18} fill={Colors.blue} />
                    : <View style={sx.checkbox} />}
                </TouchableOpacity>
                <Text selectable={false} style={[sx.rememberText, { marginLeft: 8 }]}>
                  Đồng ý với{' '}
                  <Text onPress={openTOS} style={{ color: Colors.blue }}>điều khoản</Text>
                  {' '}và{' '}
                  <Text onPress={openPolicy} style={{ color: Colors.blue }}>chính sách</Text>
                  {' '}của Uway
                </Text>
              </View>

              {/* Lỗi chung */}
              {!!error && !error.includes('họ và tên') && <Text style={[sx.errorText, { marginTop: 8 }]}>{error}</Text>}

              {/* Nút Đăng ký */}
              <TouchableOpacity
                style={[sx.loginBtn, !isValid && sx.loginBtnDisabled]}
                disabled={!isValid}
                onPress={handleSignUp}
              >
                <Text style={[sx.loginBtnText, !isValid && sx.loginBtnTextDisabled]}>Đăng ký</Text>
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

            {/* Modal thành công */}
            <SuccessModal
              visible={ok}
              onClose={() => setOk(false)}
              icon={<Icons.Success width={60} height={60} />}
              title="Đăng ký thành công"
              message="Vui lòng chờ, bạn sẽ được chuyển hướng đến trang chủ"
              autoCloseMs={2000}
            />
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;