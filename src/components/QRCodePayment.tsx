import {
  Clipboard,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import FastImage from 'react-native-fast-image';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../assets/Colors';
import { Fonts } from '../assets/Fonts';
import { Icons } from '../assets/icons';
import { s3Url } from '../services/APIConfig';
import useUploadBill from '../ultils/useUploadBill';
import { useServicePackagesStore } from '../states/servicePackages/servicePackagesStore';
import { DataTransaction } from '../services/wallet/typings';

type Props = {
  transaction: DataTransaction;
  duration?: number;
  onTimeout?: () => void;
  onPaymentSuccess?: () => void;
};

// Helper để format tiền tệ
const formatCurrency = (amount: number) => {
  if (typeof amount !== 'number') return '0đ';
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Helper để format thời gian MM:SS
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const QRCodePayment = (props: Props) => {
  const { transaction, duration = 600, onTimeout, onPaymentSuccess } = props;

  const [billImg, setBillImg] = useState<string>('');
  const [qrZoomed, setQrZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(duration);
  const [isExpired, setIsExpired] = useState(false); // Trạng thái hết hạn
  const { setEvidenceImage, evidenceImage } = useServicePackagesStore();
  const { uploadImage } = useUploadBill();

  // Logic đếm ngược
  useEffect(() => {
    if (countdown <= 0) {
      setIsExpired(true);
      if (onTimeout) onTimeout();
      return;
    }
    const timerId = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [countdown, onTimeout]);

  const bankInfo = {
    bankName: 'MB Bank',
    accountNumber: '0286789230261',
    accountName: 'Uway',
  };

  const copyToClipboard = (text: string, label: string) => {
    if (isExpired) {
      Alert.alert('Giao dịch hết hạn', 'Không thể sao chép vì giao dịch đã hết hạn.');
      return;
    }
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `${label}: ${text}`);
  };

  const handleChooseImage = () => {
    if (isLoading || isExpired) {
      if (isExpired) {
        Alert.alert('Giao dịch hết hạn', 'Không thể tải ảnh vì giao dịch đã hết hạn.');
      }
      return;
    }
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets[0].uri) {
        setIsLoading(true);
        try {
          const source = response.assets[0].uri;
          const fileName = await uploadImage(source);
          if (fileName) {
            setBillImg(`${s3Url}${fileName}`);
            setEvidenceImage(fileName);
          }
        } catch (error) {
          Alert.alert('Lỗi', 'Tải ảnh lên thất bại.');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleZoomQR = () => {
    if (isExpired) {
      Alert.alert('Giao dịch hết hạn', 'Không thể phóng to mã QR vì giao dịch đã hết hạn.');
      return;
    }
    setQrZoomed(true);
  };

  const transactionContent = `UWAY ${transaction.id.substring(0, 8)}`;
  const qrCodeUrl = `https://api.vietqr.io/image/970422-0286789230621-cNqWuPo.jpg?amount=${transaction.amount}&addInfo=${transaction.id}`;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#B8D2FD']} style={styles.paymentContainer}>
        <View style={[styles.card, isExpired && styles.cardDisabled]}>
          <TouchableOpacity onPress={handleZoomQR} activeOpacity={0.8} style={styles.qrTouchable} disabled={isExpired}>
            <View style={[styles.qrContainer, isExpired && styles.qrContainerDisabled]}>
              <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} resizeMode="contain" />
              {isExpired && (
                <View style={styles.expiredOverlay}>
                  <Text style={styles.expiredText}>Hết hạn</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>QR thanh toán hết hạn sau</Text>
            <Text style={[styles.countdownText, isExpired && styles.countdownTextExpired]}>
              {formatTime(countdown)}
            </Text>
          </View>

          <View style={styles.bankInfoContainer}>
            <InfoRow label="Ngân hàng" value={bankInfo.bankName} />
            <InfoRow label="Chủ TK" value={bankInfo.accountName} />
            <InfoRow
              label="STK"
              value={bankInfo.accountNumber}
              onCopy={() => copyToClipboard(bankInfo.accountNumber, 'Số tài khoản')}
            />
            <InfoRow
              label="Nội dung"
              value={transactionContent}
              onCopy={() => copyToClipboard(transaction.id, 'Nội dung')}
            />
            <InfoRow label="Thanh toán" value={formatCurrency(transaction.amount)} isAmount />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.paymentButton, isExpired && styles.paymentButtonDisabled]}
          onPress={handleChooseImage}
          disabled={isExpired || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.paymentButtonText}>Up bill thanh toán</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <Text style={styles.txtUpdateBill}>Cập nhật hóa đơn thanh toán</Text>

      <View style={styles.billUploadSection}>
        <Text style={styles.billSectionTitle}>Hóa đơn thanh toán</Text>
        {billImg ? (
          <View style={styles.billImageContainer}>
            <FastImage style={styles.billImage} source={{ uri: billImg }} resizeMode="cover" />
            <View style={styles.billImageOverlay}>
              <TouchableOpacity
                style={[styles.changeBillButton, isExpired && styles.changeBillButtonDisabled]}
                onPress={handleChooseImage}
                disabled={isExpired}
              >
                <Icons.Editlocation />
                <Text style={styles.changeBillText}>Thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.billPlaceholder, isExpired && styles.billPlaceholderDisabled]}>
            <View style={styles.placeholderIcon}>
              <Icons.Camera />
            </View>
            <Text style={styles.placeholderTitle}>Chưa có hóa đơn</Text>
            <Text style={styles.placeholderSubtitle}>
              Vui lòng tải lên hóa đơn thanh toán để hoàn tất giao dịch
            </Text>
          </View>
        )}
      </View>

      <Modal visible={qrZoomed} transparent animationType="fade" onRequestClose={() => setQrZoomed(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setQrZoomed(false)}
          disabled={isExpired}
        >
          <Image source={{ uri: qrCodeUrl }} style={styles.enlargedQrCode} resizeMode="contain" />
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const InfoRow = ({
  label,
  value,
  onCopy,
  isAmount = false,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  isAmount?: boolean;
}) => (
  <View style={styles.infoRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <Text style={styles.bankInfoText}>{label}</Text>
      <Text style={styles.colonText}>:</Text>
      <Text style={[styles.bankInfoValue, isAmount && styles.amountValue]}>{value}</Text>
    </View>
    {onCopy && (
      <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
        <Icons.Paste />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  paymentContainer: {
    marginVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
    borderRadius: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    elevation: 10,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  qrTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 10,
    shadowColor: Colors.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
  },
  qrContainerDisabled: {
    opacity: 0.5,
  },
  qrCode: {
    width: 140,
    height: 140,
    borderRadius: 25,
  },
  expiredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 90,
  },
  expiredText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.fontFamily.LexendBold,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  timerText: {
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.textSecondary,
  },
  countdownText: {
    fontSize: 24,
    fontFamily: Fonts.fontFamily.LexendBold,
    color: Colors.main,
    letterSpacing: 2,
    marginTop: 4,
  },
  countdownTextExpired: {
    color: Colors.red,
  },
  bankInfoContainer: {
    width: '100%',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  bankInfoText: {
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.textPrimary,
    width: 95,
  },
  colonText: {
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.textPrimary,
    marginRight: 6,
    marginLeft: -13,
  },
  bankInfoValue: {
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  amountValue: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  copyButton: {
    paddingLeft: 1,
  },
  paymentButton: {
    backgroundColor: Colors.main,
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  paymentButtonDisabled: {
    backgroundColor: Colors.grayLight,
    elevation: 0,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
  },
  txtUpdateBill: {
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.grayDark,
    marginVertical: 10,
  },
  billUploadSection: {
    marginVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  billSectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  billImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  billImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
  },
  billImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBillButton: {
    backgroundColor: Colors.main,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeBillButtonDisabled: {
    backgroundColor: Colors.grayLight,
    opacity: 0.6,
  },
  changeBillText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendMedium,
    marginLeft: 8,
  },
  billPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
  },
  billPlaceholderDisabled: {
    opacity: 0.6,
  },
  placeholderIcon: {
    marginBottom: 16,
    backgroundColor: Colors.mainLight,
    padding: 16,
    borderRadius: 50,
  },
  placeholderTitle: {
    fontSize: 16,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedQrCode: {
    width: 300,
    height: 300,
  },
});

export default QRCodePayment;