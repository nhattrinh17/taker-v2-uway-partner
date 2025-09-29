import { RouteProp } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Image
} from 'react-native';
import { RootNavigatorParamList } from '../../navigation/typings';
import { Images } from '../../assets/Images';
import { Fonts } from '../../assets/Fonts';
import { Colors } from '../../assets/Colors';
import { useOtp, useOtpVerify } from '../../services/auth';
import { appStore } from '../../states/app';
import { goBack, navigationRef } from '../../navigation/utils/navigationUtils';
import Toast from 'react-native-toast-message';
import { Icons } from '../../assets';
import { useUserStore } from '../../states/user';
import SuccessModal from '../../components/SuccessModal';
import { navigate } from '../../navigation/utils/navigationUtils';

type Props = {
  navigation: any;
  route: RouteProp<RootNavigatorParamList, 'Otp'>;
};

const Otp: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber, id, type, name, email, password, confirmPassword, referralCode, checked, typeService } = route.params || {};
  const { setLoading } = appStore();
  const [ok, setOk] = useState(false);
  const { triggerOtp } = useOtp();
  const { triggerOtpVerify } = useOtpVerify();
  console.log('TYPE: ', type);

  // ====== State cho OTP ======
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));
  const [timer, setTimer] = useState<number>(60);
  const [method, setMethod] = useState<string>(id || ''); // 'ZALO' | 'SMS' nếu BE trả
  const [hasSent, setHasSent] = useState(false);

  // Đếm ngược resend
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  // Gửi OTP khi vào màn (đăng ký SĐT lần đầu)
  const effectiveType = type ?? 'existed';

  useEffect(() => {
    if (hasSent && !name) return;
    const sendOtp = async () => {
      console.log('[Otp] Gửi OTP:', { id: phoneNumber, type: type ?? 'existed' });
      setLoading(true);
      try {
        const res = await triggerOtp({ type: type ?? 'existed', phone: phoneNumber });
        console.log('[Otp] ✅ triggerOtp OK:', res?.data);
        setMethod(res?.data?.method || res?.data);
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: `Mã OTP đã được gửi${res?.data?.method
            ? ` qua ${res.data.method === 'ZALO' ? 'Zalo' : 'SMS'}`
            : ''}`,
          visibilityTime: 3000,
        });
      } catch (e: any) {
        console.log('[Otp] ❌ triggerOtp lỗi:', e);
        Toast.show({
          type: 'error',
          text1: 'Gửi OTP thất bại',
          text2: e?.data?.message || 'Vui lòng thử lại',
        });
      } finally {
        setLoading(false);
        setHasSent(true); // ✅ đánh dấu đã gửi
      }
    };
    sendOtp();
    // chỉ chạy một lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Nhập OTP
  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Paste 1 phát 6 số
      const pasted = text.slice(0, 6).split('');
      const next = [...code];
      pasted.forEach((d, i) => {
        if (index + i < 6) next[index + i] = d;
      });
      setCode(next);
      const firstEmpty = next.findIndex(v => !v);
      inputRefs.current[(firstEmpty === -1 ? 5 : Math.max(firstEmpty - 1, 0))]?.focus();
      return;
    }
    const next = [...code];
    next[index] = text;
    setCode(next);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !code[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Xác thực OTP
  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length < 6 || timer === 0) return;

    try {
      setLoading(true);
      const otpRes = await triggerOtpVerify({ otp, phone: phoneNumber });
      console.log('===> Res:', otpRes);
      // Đăng ký xong → quay về Login; nếu là 'forgot' thì ở chỗ gọi có thể navigate khác
      if (type === 'existed' && !name) {
        navigationRef.navigate('ChangePassword', { phone: phoneNumber } as any);
      } else if (type === 'existed' && !!name) {
        setOk(true);
      }
      else {
        console.log(" ✅ Xác thực thành công, điều hướng sang Login");
        setOk(true);
        //navigationRef.navigate('Login');
      }
    } catch (e: any) {
      console.log('==>OTP:', e);
      const errCode = e?.data?.error || e?.response?.data?.error;
      const errMsg = e?.data?.message || e?.response?.data?.message;
      if (errCode === 'otp_limit_exceeded') {
        Toast.show({
          type: 'error',
          text1: 'Quá số lần cho phép',
          text2: 'Bạn đã nhập sai OTP quá số lần quy định. Vui lòng yêu cầu gửi lại mã mới.',
        });
      } else if (errCode === 'opt_expired') {
        Toast.show({
          type: 'error',
          text1: 'Mã OTP đã hết hạn',
          text2: 'Mã OTP của bạn đã quá hạn. Vui lòng yêu cầu gửi lại mã mới.',
        });
      } else if (errCode === 'otp_invalid') {
        Toast.show({
          type: 'error',
          text1: 'Mã OTP không đúng',
          text2: 'Mã OTP không đúng. Vui lòng yêu cầu gửi lại mã mới.',
        });
      }
      else {
        Toast.show({
          type: 'error',
          text1: 'Xác thực thất bại',
          text2: 'Mã OTP không chính xác',
        });
      }

    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã
  const handleResendCode = async () => {
    if (timer > 0) return;
    console.log("[Otp] Resend OTP payload:", { id: phoneNumber, type: 'existed' });
    try {
      await triggerOtp({ phone: phoneNumber, type: 'existed' });
      setTimer(60);
      Toast.show({ type: 'success', text1: 'Đã gửi lại mã OTP' });
    } catch (e: any) {
      console.log("[Otp] ❌ Resend lỗi:", e);
      Toast.show({ type: 'error', text1: 'Gửi lại OTP thất bại', text2: e?.data?.message === 'otp_limit_exceeded' ? 'Đã quá số lần gửi OTP. Vui lòng thử lại sau ít phút' : 'Vui lòng thử lại' });
    }
  };

  return (
    <SafeAreaView style={sx.container}>
      <StatusBar barStyle="dark-content" />
      {/* Back */}
      <View style={sx.header}>
        {/* Back button */}
        <TouchableOpacity
          style={sx.backBtn}
          onPress={() => {
            if (type === 'existed' && !name) {
              // Nếu là quên mật khẩu → quay về Login
              navigate('Login');
            }
            else if (!type) {
              navigate('Login');
            } else if (type === 'existed' || type === 'not-existed') {
              // Mặc định quay lại SignUp và giữ lại các tham số cũ
              navigate('SignUp', {
                name,
                email,
                phoneNumber,
                password,
                confirmPassword,
                referralCode,
                type,
                checked,
              });
            }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
        >
          {Icons.Backbutton
            ? <Icons.Backbutton width={32} height={32} />
            : <Text style={sx.backTxt}>‹</Text>
          }
        </TouchableOpacity>

        {/* Logo */}
        <Image source={Images.LogoApp} style={sx.logo} />
      </View>
      {/* Title + subtitle */}
      <View style={sx.titleWrap}>
        <Text style={sx.title}>Xác thực thông tin</Text>
        <Text style={sx.subtitle}>
          Chúng tôi đã gửi mã xác minh OTP đến số điện thoại của bạn (
          {(id || method) === 'ZALO' ? 'Zalo' : 'SMS'}
          ). Nhập mã để xác minh và tiếp tục.
        </Text>
        <Text style={sx.phone}>
          {phoneNumber?.slice(0, -3)?.replace(/\d/g, '*') + phoneNumber?.slice(-3)}
        </Text>
      </View>
      {/* 6 ô OTP */}
      <View style={sx.otpRow}>
        {Array(6).fill(0).map((_, index) => (
          <TextInput
            key={index}
            ref={ref => { if (ref) inputRefs.current[index] = ref; }}
            style={sx.otpInput}
            value={code[index]}
            onChangeText={text => handleCodeChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
      {/* timer */}
      <Text style={sx.timer}>00:{String(timer).padStart(2, '0')}</Text>
      {/* nút xác thực */}
      <TouchableOpacity
        style={[
          sx.primaryBtn,
          (code.join('').length < 6 || timer === 0) && sx.btnDisabled
        ]}
        onPress={handleVerify}
        disabled={code.join('').length < 6 || timer === 0}
        activeOpacity={0.9}
      >
        <Text style={sx.primaryText}>Xác thực</Text>
      </TouchableOpacity>
      {/* Gửi lại mã */}
      <View style={sx.resendWrap}>
        <Text style={sx.resendText}>Bạn chưa nhận được mã? </Text>
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={timer > 0}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={[sx.resendLink, timer > 0 && sx.resendDisabled]}>
            Gửi lại mã
          </Text>
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
    </SafeAreaView>
  );
};

const sx = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  backBtn: {
    // 3. Dùng position absolute để đưa nút back về bên trái
    position: 'absolute',
    left: 0,
    // Căn nút back theo chiều dọc với header
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    // Giữ các style cũ
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center', // Căn giữa logo theo chiều ngang
    alignItems: 'center',     // Căn các item theo chiều dọc
    height: 58,                // Đặt chiều cao cho header
    marginTop: 36,
  },

  backTxt: { fontSize: 20, color: Colors.white },
  logo: { width: 130, height: 58, resizeMode: 'contain', alignSelf: 'center', marginTop: 15 },
  titleWrap: { alignItems: 'center', marginTop: 8 },
  title: { color: Colors.black, fontSize: 18, fontFamily: Fonts.fontFamily.LexendBold, marginTop: 6 },
  subtitle: {
    marginTop: 8, textAlign: 'center', color: Colors.black,
    fontFamily: Fonts.fontFamily.LexendRegular, lineHeight: 20,
  },
  phone: { marginTop: 4, color: Colors.blue, fontFamily: Fonts.fontFamily.LexendSemiBold },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 14 },
  otpInput: {
    width: 48, height: 54, borderRadius: 12, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: '#E5EEF5', textAlign: 'center',
    fontSize: 20, fontFamily: Fonts.fontFamily.LexendSemiBold, color: Colors.black,
  },
  timer: { marginTop: 10, textAlign: 'center', color: Colors.black, fontFamily: Fonts.fontFamily.LexendRegular },
  primaryBtn: {
    marginTop: 16, height: 48, borderRadius: 24, backgroundColor: Colors.blue,
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 8,
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
  },
  btnDisabled: { backgroundColor: Colors.mainLight },
  primaryText: { color: Colors.white, fontSize: 15, fontFamily: Fonts.fontFamily.LexendSemiBold },
  resendWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  resendText: { color: Colors.black, fontFamily: Fonts.fontFamily.LexendRegular, fontSize: 12 },
  resendLink: { color: Colors.blue, fontFamily: Fonts.fontFamily.LexendSemiBold, fontSize: 12 },
  resendDisabled: { opacity: 0.5 },
});

export default Otp;
