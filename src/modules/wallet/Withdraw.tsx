import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { RouteProp, useNavigation } from '@react-navigation/native';
import WalletPasswordModal from '../../components/WalletPasswordModal';
import { useUserStore } from '../../states/user';
import { useState } from 'react';
import InfoModal from '../../components/modals/InfoModal';
import { useWithdrawWallet, useGetWalletAccessCode } from '../../services/wallet/index'
import SuccessModal from '../../components/SuccessModal';
import { RootNavigatorParamList } from '../../navigation/typings';
import FailureModal from '../../components/FailureModal';

type Props = {
  route: RouteProp<RootNavigatorParamList, 'WithDraw'>;
};
const presetAmounts = [100000, 200000, 300000, 500000, 1000000, 2000000];

const Withdraw = (props: Props) => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();

  // SỬA ĐỔI: Lấy `balance` từ user store và khởi tạo các hook API
  const { user, balance } = useUserStore(state => state);
  const { triggerWithdrawWallet } = useWithdrawWallet();
  const { triggerGetWalletAccessCode } = useGetWalletAccessCode();

  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  // SỬA ĐỔI: Thêm state quản lý loading
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalConfig, setInfoModalConfig] = useState({ title: '', message: '' });
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null); // thời điểm hết khóa
  const [lastFailTime, setLastFailTime] = useState<number | null>(null);
  const transactionFee = 0; // Phí này nên được lấy từ API
  const totalAmount = amount + transactionFee;

  const now = () => Date.now();
  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN');
  };

  const isBankInfoMissing = !user?.bankAccountName || !user?.bankAccountNumber || !user?.bankName;

  // SỬA ĐỔI: Thêm logic kiểm tra số dư
  const handleWithdrawPress = () => {
    if (isBankInfoMissing) return;
    if (lockUntil && now() < lockUntil) {
      const remain = Math.ceil((lockUntil - now()) / 60000);
      setInfoModalConfig({
        title: 'Tài khoản tạm khóa',
        message: `Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau ${remain} phút.`,
      });
      setInfoModalVisible(true);
      return;
    }
    // Reset đếm nếu quá 30 phút từ lần sai gần nhất
    if (lastFailTime && now() - lastFailTime > 30 * 60 * 1000) {
      setWrongCount(0);
      setLastFailTime(null);
    }
    if (amount <= 0) {
      setInfoModalConfig({ title: "Số tiền không hợp lệ", message: "Vui lòng nhập số tiền rút lớn hơn 0." });
      setInfoModalVisible(true);
      return;
    }
    if (totalAmount > balance) {
      setInfoModalConfig({ title: "Không đủ số dư", message: `Số dư trong ví của bạn không đủ để thực hiện giao dịch này. Bạn cần ${formatCurrency(totalAmount)}đ.` });
      setInfoModalVisible(true);
      return;
    }
    // Nếu đủ số dư, mở modal nhập mật khẩu
    setPasswordModalVisible(true);
  };

  // SỬA ĐỔI: Hoàn thiện logic gọi API sau khi xác nhận mật khẩu
  const handleConfirmPassword = async (password: string) => {
    setPasswordModalVisible(false);
    setIsLoading(true);
    try {
      const accessCodeRes = await triggerGetWalletAccessCode({ password });
      const accessCode = accessCodeRes.data;
      if (!accessCode) throw new Error("ACCESS_CODE_INVALID");

      await triggerWithdrawWallet({ amount, accessCode });
      setSuccessModalVisible(true);

      // ✅ Nếu rút thành công thì reset đếm sai
      setWrongCount(0);
      setLastFailTime(null);
    } catch (error: any) {
      console.error("Lỗi khi rút tiền:", error);

      // --------- XỬ LÝ SAI MẬT KHẨU ----------
      const isWrongPass =
        error?.data?.message === 'ACCESS_CODE_INVALID' ||
        error?.message === 'ACCESS_CODE_INVALID' ||
        error?.data?.message === 'Internal Server Error'; // tuỳ API trả

      if (isWrongPass) {
        const nowTime = Date.now();
        const newCount = wrongCount + 1;
        setWrongCount(newCount);
        setLastFailTime(nowTime);

        if (newCount >= 5) {
          // khoá 5 phút
          setLockUntil(nowTime + 5 * 60 * 1000);
          setInfoModalConfig({
            title: "Tài khoản tạm khóa",
            message: "Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau 5 phút.",
          });
          setInfoModalVisible(true);
        } else {
          setInfoModalConfig({
            title: "Rút tiền thất bại",
            message: `Mật khẩu không chính xác. Bạn còn ${5 - newCount} lần thử.`,
          });
          setInfoModalVisible(true);
        }
      } else {
        setInfoModalConfig({
          title: "Rút tiền thất bại",
          message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        });
        setInfoModalVisible(true);
      }
      // ---------------------------------------
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Backbutton width={27} height={27} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rút tiền</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* SỬA ĐỔI: Hiển thị thông tin tài khoản từ user store */}
        <Text style={styles.cardTitle}>Tài khoản hưởng thụ</Text>
        <View style={styles.card}>
          <InfoRow label="Chủ tài khoản:" value={user?.bankAccountName || 'Chưa cập nhật'} />
          <InfoRow label="Số tài khoản:" value={user?.bankAccountNumber || 'Chưa cập nhật'} />
          <InfoRow label="Ngân hàng:" value={user?.bankName || 'Chưa cập nhật'} isLast />
        </View>
    {isBankInfoMissing && (
          <Text style={styles.warningText}>
            Vui lòng cập nhật thêm thông tin tài khoản thụ hưởng trước khi rút tiền.
          </Text>
        )}
        {/* Nhập số tiền */}
        <Text style={styles.inputLabel}>Nhập số tiền (VNĐ)</Text>
        <TextInput
          style={styles.amountInput}
          value={formatCurrency(amount)}
          onChangeText={(text) => {
            // Chỉ giữ lại chữ số
            const numeric = text.replace(/\D/g, '');
            setAmount(numeric === '' ? 0 : parseInt(numeric, 10));
          }}
          keyboardType="numeric"
        />

        {/* Các mức tiền gợi ý */}
        <Text style={styles.inputLabel}>Số tiền rút (VNĐ)</Text>
        <View style={styles.presetCard}>
          <View style={styles.presetGrid}>
            {presetAmounts.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetButton,
                  amount === preset && styles.presetButtonSelected,
                ]}
                onPress={() => setAmount(preset)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    amount === preset && styles.presetButtonTextSelected,
                  ]}
                >
                  {formatCurrency(preset)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Thẻ tóm tắt */}
        <View style={styles.summaryCard}>
          <SummaryRow label="Số tiền rút:" value={`${formatCurrency(amount)}đ`} />
          <SummaryRow label="Phí giao dịch:" value={`${formatCurrency(transactionFee)}đ`} />
          <SummaryRow label="Tổng thanh toán:" value={`${formatCurrency(totalAmount)}đ`} isTotal isLast />
        </View>

        {/* Nội dung */}
        <Text style={styles.inputLabel}>Nội dung</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Nội dung tin nhắn..."
          placeholderTextColor="#999"
          value={note}
          onChangeText={setNote}
          multiline
        />
      </ScrollView>

      {/* Nút Tiếp tục */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (isLoading || isBankInfoMissing || (lockUntil && Date.now() < lockUntil))
              ? styles.continueButtonDisabled
              : undefined
          ]}
          onPress={handleWithdrawPress}
          disabled={!!(isLoading|| isBankInfoMissing || (lockUntil && Date.now() < lockUntil))}
        >
          {isLoading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.continueButtonText}>Tiếp tục</Text>}
        </TouchableOpacity>

      </View>

      <WalletPasswordModal
        isVisible={isPasswordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        onConfirm={handleConfirmPassword}
      />
      <InfoModal
        visible={isInfoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title={infoModalConfig.title}
        message={infoModalConfig.message}
        primaryText="Đã hiểu"
      />

      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
        title="Yêu cầu thành công"
        message="Yêu cầu rút tiền của bạn đã được gửi đi và đang chờ xử lý."
        icon={<Icons.Success width={60} height={60} />}
        autoCloseMs={2000}
      />
    </View>
  );
};

// --- Các component con và style không đổi ---
interface InfoRowProps { label: string; value: string; isLast?: boolean; }
const InfoRow: React.FC<InfoRowProps> = ({ label, value, isLast = false }) => (
  <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

interface SummaryRowProps { label: string; value: string; isTotal?: boolean; isLast?: boolean; }
const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, isTotal = false, isLast = false }) => (
  <View style={[styles.summaryRow, isLast && { borderBottomWidth: 0 }]}>
    <Text style={isTotal ? styles.summaryLabelTotal : styles.summaryLabel}>{label}</Text>
    <Text style={isTotal ? styles.summaryValueTotal : styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  warningText: {
  color: 'red',
  fontSize: 14,
  marginBottom: 16,
},
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: { fontSize: 14, color: "#000000" },
  infoValue: { fontSize: 14, color: "#000000" },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  amountInput: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 15,
  },
  presetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: '32%',
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  presetButtonSelected: {
    borderColor: Colors.blue,
    backgroundColor: 'white',
  },
  presetButtonText: {
    fontSize: 14,
    color: "#000000E5",
  },
  presetButtonTextSelected: {
    color: Colors.blue,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
    marginTop: 24,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: { fontSize: 14, color: "#000000" },
  summaryValue: { fontSize: 14, color: "#000000" },
  summaryLabelTotal: { fontSize: 14, color: "#000000" },
  summaryValueTotal: { fontSize: 14, color: "#000000" },
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 150,
    padding: 16,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  footer: {
    padding: 16,
    backgroundColor: '#F4F8FB',
  },
  continueButton: {
    backgroundColor: Colors.blue,
    borderRadius: 30,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Withdraw;