import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../assets/Colors';
import { Icons } from '../../assets';
import { useNavigation } from '@react-navigation/native';
import { useDepositWallet, useUpBill } from '../../services/wallet';
import { Transaction } from '../../services/wallet/typings';
import { useUserStore } from '../../states/user';
import QRCodePayment from '../../components/QRCodePayment';
import SuccessModal from '../../components/SuccessModal';
import InfoModal from '../../components/modals/InfoModal';
import { useServicePackagesStore } from '../../states/servicePackages/servicePackagesStore';
import { SafeAreaView } from 'react-native-safe-area-context';
const presetAmounts = [100000, 200000, 300000, 500000, 1000000, 2000000];

const Deposit = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();

  const [step, setStep] = useState<'amount' | 'qr'>('amount');
  const [amount, setAmount] = useState(0);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { evidenceImage, setEvidenceImage } = useServicePackagesStore();
  const { triggerDepositWallet } = useDepositWallet();
  const { triggerUpBill } = useUpBill();
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalConfig, setInfoModalConfig] = useState({ title: '', message: '' });
  const transactionFee = 0; // Phí này nên được lấy từ API
  const totalAmount = amount + transactionFee;

  // Log để debug evidenceImage
  useEffect(() => {
    console.log('evidenceImage:', evidenceImage);
  }, [evidenceImage]);

  // Reset evidenceImage khi vào màn hình
  useEffect(() => {
    setEvidenceImage('');
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN');
  };

  const handleContinue = async () => {
    if (step === 'amount') {
      if (amount < 5000 || amount > 10000000) {
        setInfoModalConfig({
          title: 'Thông báo',
          message: 'Số tiền nạp phải từ 5.000đ đến 10.000.000đ',
        });
        setInfoModalVisible(true);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (step === 'amount') {
        const res = await triggerDepositWallet({ amount });
        console.log('reponse api: ',res);
        if (res && res.data) {
          setTransaction(res.data);
          console.log('==>', transaction)
          setStep('qr');
        }
      } else if (step === 'qr' && transaction) {
        console.log('evidence:', evidenceImage);
        if (!evidenceImage ) {
          setInfoModalConfig({
            title: 'Thông báo',
            message: 'Vui lòng tải lên hóa đơn thanh toán.',
          });
          setInfoModalVisible(true);
          setIsLoading(false); 
          return;
        }
        await triggerUpBill({
          transactionId: transaction.id,
          evidence: evidenceImage,
        });
        setSuccessModalVisible(true);
      }
    } catch (error) {
      console.error('Lỗi giao dịch:', error);
      setInfoModalConfig({
        title: 'Lỗi',
        message: 'Đã có lỗi xảy ra, vui lòng thử lại.',
      });
      setInfoModalVisible(true);
    } finally {
      setIsLoading(false);
      console.log('isLoading reset to false');
    }
  };

  const renderContent = () => {
    if (step === 'amount') {
      return (
        <>
          <Text style={styles.inputLabel}>Nhập số tiền (VNĐ)</Text>
          <TextInput
            style={styles.amountInput}
            value={formatCurrency(amount)}
            onChangeText={(text) => {
              const numeric = text.replace(/\D/g, '');
              setAmount(numeric === '' ? 0 : parseInt(numeric, 10));
            }}
            keyboardType="numeric"
          />
          <Text style={styles.inputLabel}>Số tiền nạp (VNĐ)</Text>
          <View style={styles.presetCard}>
            <View style={styles.presetGrid}>
              {presetAmounts.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetButton, amount === preset && styles.presetButtonSelected]}
                  onPress={() => setAmount(preset)}
                >
                  <Text style={[styles.presetButtonText, amount === preset && styles.presetButtonTextSelected]}>
                    {formatCurrency(preset)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.summaryCard}>
            <SummaryRow label="Số tiền nạp:" value={`${formatCurrency(amount)}đ`} />
            <SummaryRow label="Phí giao dịch:" value={`${formatCurrency(transactionFee)}đ`} />
            <SummaryRow label="Tổng thanh toán:" value={`${formatCurrency(totalAmount)}đ`} isTotal isLast />
          </View>
        </>
      );
    }

    if (step === 'qr' && transaction) {
      return (
        <QRCodePayment transaction={transaction} />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
    <View style={[styles.container, { paddingTop: top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step === 'qr' ? setStep('amount') : navigation.goBack())}>
          <Icons.Backbutton width={27} height={27} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nạp tiền</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, (isLoading || (step === 'qr' && !evidenceImage)) && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          // disabled={isLoading || (step === 'qr' && !evidenceImage)}
        >
          {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.continueButtonText}>Tiếp tục</Text>}
        </TouchableOpacity>
      </View>
      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
        title="Giao dịch thành công"
        message="Giao dịch của bạn đã được ghi nhận. Vui lòng đợi xác nhận từ Uway trong thời gian sớm nhất."
        icon={<Icons.Success width={60} height={60} />}
        autoCloseMs={2000}
      />

      <InfoModal
        visible={isInfoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title={infoModalConfig.title}
        message={infoModalConfig.message}
        primaryText="Đã hiểu"
      />
    </View>
    </SafeAreaView>
  );
};

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
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 10,
  },
  amountInput: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#E6F3FF',
  },
  presetButtonText: {
    fontSize: 14,
    color: '#000000E5',
  },
  presetButtonTextSelected: {
    color: Colors.blue,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: { fontSize: 14, color: '#000000' },
  summaryValue: { fontSize: 14, color: '#000000' },
  summaryLabelTotal: { fontSize: 14, color: '#000000' },
  summaryValueTotal: { fontSize: 14, color: '#000000' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: '#F4F8FB',
  },
  continueButton: {
    backgroundColor: '#0B96DF',
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

export default Deposit;