import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TextInput, TouchableOpacity, Pressable, StatusBar, Image, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Images } from '../../assets/Images';
import { Picker } from '@react-native-picker/picker';
import { Icons } from '../../assets';
import { Fonts } from '../../assets/Fonts';
import { authorize } from 'react-native-app-auth';
//import { useLoginFacebook, useLoginGoogle, useSignUp } from '../../services/auth';
import { isValidVietnamesePhone, isValidPassword } from '../../ultils/validation';
import { useSignUp } from '../../services/auth';
import { LoginManager, AccessToken, Profile } from 'react-native-fbsdk-next';
import { useUserStore } from '../../states/user';
import { appStore } from '../../states/app';
import { sx } from './authStyles';
import { navigationRef, replace } from '../../navigation/utils/navigationUtils';
import { Colors } from '../../assets/Colors';
import SuccessModal from '../../components/SuccessModal';
import { navigate } from '../../navigation/utils/navigationUtils';
import { RootNavigatorParamList } from '../../navigation/typings';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
// import { isValidPassword } from '../../utils/validation';
// import { isValidVietnamesePhone } from '../../utils/validation';
// import FailureModal from '../../components/FailureModal';

type SignUpRouteProp = RouteProp<RootNavigatorParamList, 'SignUp'>;

const SignUp = () => {
  const { setLoading } = appStore(state => state);
  const { setToken, setUser, user, token } = useUserStore(state => state);
  //   const { triggerLoginGG } = useLoginGoogle();
  //   const { triggerLoginFB } = useLoginFacebook();
  const { triggerSignUp } = useSignUp();
  const route = useRoute<SignUpRouteProp>();

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
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntry2, setSecureTextEntry2] = useState(true);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  //   const validForm = () => {
  //     if (name === '') {
  //       return false;
  //     }
  //     if (address === '') {
  //       return false;
  //     }
  //     if (!checked) {
  //       return false;
  //     }
  //     return true;
  //   };
  //   useEffect(() => {
  //     if (validForm()) {
  //       setIsValid(true);
  //     } else {
  //       setIsValid(false);
  //     }
  //   }, [name, phoneNumber, password, address, checked]);

  //   const config = {
  //     issuer: 'https://accounts.google.com',
  //     clientId: '133817269160-jn8i430sqtn8loa8mvfdt773h97i2tgg.apps.googleusercontent.com',
  //     redirectUrl: 'com.Xiinapp:/oauth2redirect/google',
  //     scopes: ['openid', 'profile', 'email'],
  //   };
  const signInWithGoogle = async () => {
    //     try {
    //       setLoading(true);
    //       const result = await authorize(config);
    //       const res = await triggerLoginGG({ accessToken: result.idToken });
    //       setToken(res.data.accessToken);
    //       setUser(res.data.user);
    //     } catch (error) {
    //       console.error('Login error', error);
    //     } finally {
    //       setLoading(false);
    //     }
    setOk(true);
  };
  const loginWithFacebook = async () => {
    //     try {
    //       setLoading(true);
    //       const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    //       if (result.isCancelled) {
    //         // console.log('Đăng nhập bị hủy.');
    //       } else {
    //         const data = await AccessToken.getCurrentAccessToken();
    //         if (data) {
    //           // console.log('Access Token:', data.accessToken.toString());
    //           const res = await triggerLoginFB({ accessToken: data.accessToken.toString() });
    //           setToken(res.data.accessToken);
    //           setUser(res.data.user);
    //           const profile = await Profile.getCurrentProfile();
    //           if (profile) {
    //             // console.log('Tên người dùng:', profile.name);
    //           }
    //         }
    //       }
    //     } catch (error) {
    //       // console.log('Đăng nhập thất bại với lỗi: ' + error);
    //     } finally {
    //       setLoading(false);
    //     }
    setOk(true);
  };

  const mapServerMsg = (msg?: string) => {
    if (!msg) return 'Có lỗi xảy ra, vui lòng thử lại';
    if (msg.includes('duplicate entry')) return 'Số điện thoại hoặc email đã tồn tại';

    switch (msg) {
      case 'phone_already_exists': return 'Số điện thoại đã tồn tại, vui lòng thực hiện đăng nhập để tiếp tục';
      case 'phone_number_invalid': return 'Số điện thoại không hợp lệ';
      case 'referral_code_not_found': return 'Mã giới thiệu không hợp lệ';
      case 'action_invalid': return 'Hành động không hợp lệ';
      default: return msg;
    }
  };

  const handleSignUp = async () => {
    setPhoneError(''); setPasswordError(''); setError('');
    console.log(" Bắt đầu đăng ký với phone:", phoneNumber);

    if (!isValidVietnamesePhone(phoneNumber)) return setPhoneError('Số điện thoại không hợp lệ');
    if (!isValidPassword(password) || /\s/.test(password)) return setPasswordError('Mật khẩu tối thiểu 6 ký tự, không có khoảng trắng');
    if (password !== confirmPassword) return setPasswordError('Mật khẩu nhập lại không khớp');
    if (!checked) {
      console.log("[SignUp] ❌ Người dùng chưa tick đồng ý điều khoản");
      return;
    }
    try {
      setLoading(true);
      const res = await triggerSignUp({
        name: name,
        password,
        address: '',
        phone: phoneNumber,
        email: email,
        type: typeService,
        referralCode: referralCode || undefined,
      });
      console.log("[SignUp] ✅ Đăng ký thành công, phản hồi từ server:", res);
      console.log("[SignUp] → Điều hướng sang Otp với params:", { id: res.data.id, phoneNumber });
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
      });
    } catch (err: any) {
      const raw = err?.data?.message;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed?.step === 'REGISTER_INFO_SUCCESS' && parsed?.status === 'PENDING') {
          console.log("[SignUp] ↪️ Tài khoản đã tồn tại, đang chờ xác thực. Chuyển sang OTP.");
          // Chuyển sang màn OTP. Màn OTP sẽ dùng phoneNumber để xác thực.
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
        
        // Xử lý trường hợp khác khi server trả về ID (nếu có)
        if (parsed?.step === 'REGISTER_INFO_SUCCESS' && parsed?.id) {
          //setPendingRegistration({ id: parsed.id, phone: phoneNumber });
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
      } catch {
        setError(mapServerMsg(raw));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsValid(
      !!name &&
      isValidVietnamesePhone(phoneNumber) &&
      isValidPassword(password) &&
      password === confirmPassword &&
      checked
    );
  }, [name, phoneNumber, password, confirmPassword, checked]);

  const openTOS = () => { /* TODO: navigate('WebView', { url: 'https://...' }) */ };
  const openPolicy = () => { /* TODO: navigate('WebView', { url: 'https://...' }) */ };


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={sx.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={sx.wrap}>

            {/* Logo */}
            <Image source={Images.LogoApp} style={sx.logo} />

            {/* Segmented: Đăng nhập / Đăng ký (Đăng ký active) */}
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
              {/* <Text style={[sx.label, { marginTop: 12 }]}>Email</Text>
              <View style={sx.inputRow}>
                {Icons.Email ? <Icons.Email width={20} height={20} /> : null}
                <TextInput
                  style={sx.input}
                  placeholder="Nhập email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor={Colors.gray}
                />
              </View> */}

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
                  { // @ts-ignore
                    Icons.Eyesplash && Icons.Eyes
                      ? // @ts-ignore
                      (secureTextEntry ? <Icons.Eyesplash /> : <Icons.Eyes />)
                      : <Text style={sx.eyeTxt}>{secureTextEntry ? 'Hiện' : 'Ẩn'}</Text>
                  }
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
                  { // @ts-ignore
                    Icons.Eyesplash && Icons.Eyes
                      ? // @ts-ignore
                      (secureTextEntry2 ? <Icons.Eyesplash /> : <Icons.Eyes />)
                      : <Text style={sx.eyeTxt}>{secureTextEntry2 ? 'Hiện' : 'Ẩn'}</Text>
                  }
                </TouchableOpacity>
              </View>
              {!!passwordError && <Text style={sx.errorText}>{passwordError}</Text>}

              {/* Mã giới thiệu (tuỳ chọn) */}
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

              <Text style={[sx.label, { marginTop: 12 }]}>Loại dịch vụ</Text>
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                {[
                  { label: "Shoe Cleaning", value: "SHOE_CLEANING" },
                  { label: "Other", value: "OTHER" },
                ].map(opt => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTypeService(opt.value)}
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 16,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: typeService === opt.value ? Colors.blue : Colors.gray,
                        borderRadius: 8,
                        backgroundColor: typeService === opt.value ? Colors.blue + "20" : "transparent",
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
                        alignItems: "center",
                        justifyContent: "center",
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

                {/* Chỉ checkbox được bấm */}
                <TouchableOpacity
                  onPress={() => setChecked(v => !v)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={sx.checkboxWrap}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: checked }}
                >
                  {checked
                    ? <Icons.Rememberpass width={18} height={18} fill={Colors.blue} />
                    : <View style={sx.checkbox} />
                  }
                </TouchableOpacity>

                {/* Label không bấm, chỉ 2 link có onPress riêng */}
                <Text selectable={false} style={[sx.rememberText, { marginLeft: 8 }]}>
                  Đồng ý với{' '}
                  <Text onPress={openTOS} style={{ color: Colors.blue }}>điều khoản</Text>
                  {' '}và{' '}
                  <Text onPress={openPolicy} style={{ color: Colors.blue }}>chính sách</Text>
                  {' '}của Uway
                </Text>
              </View>


              {/* Lỗi chung */}
              {!!error && <Text style={[sx.errorText, { marginTop: 8 }]}>{error}</Text>}

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

            {/* Modal thành công (dùng chung) */}
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
