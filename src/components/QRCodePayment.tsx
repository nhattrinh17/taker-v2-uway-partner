import { Clipboard, Image, Modal, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import FastImage from 'react-native-fast-image';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../assets/Colors';
import { Fonts } from '../assets/Fonts';
import { Icons } from '../assets/icons';
import { s3Url } from '../services/APIConfig';
import useUploadBill from '../ultils/useUploadBill';
import { useUserStore } from '../states/user';
import { DataTransaction } from '../services/wallet/typings';

type Props = {
  transaction: DataTransaction;
};

const QRCodePayment = (props: Props) => {
  const { transaction } = props;
  const [billImg, setBillImg] = useState<string>('');
  const [qrZoomed, setQrZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setEvidenceImage } = useUserStore();
  const { uploadImage } = useUploadBill();

  const bankInfo = {
    bankName: 'Vietinbank',
    accountNumber: '0123456789',
    accountName: 'Uway',
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Đã sao chép", `Đã sao chép: ${text}`);
  };

  const handleChooseImage = () => {
    if (isLoading) return;
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Lỗi", "Không thể chọn ảnh, vui lòng thử lại.");
        return;
      }
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
          Alert.alert("Lỗi", "Tải ảnh lên thất bại.");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const qrCodeUrl = `https://api.vietqr.io/image/970422-0286789230261-cNqWuPo.jpg?amount=${transaction.amount}&addInfo=${transaction.id}`;

  return (
    <View style={styles.container}>
      {/* Payment Code Section */}
      <Text style={styles.sectionTitle}>Mã thanh toán</Text>
      
      <View style={styles.paymentCardContainer}>
        {/* Lớp nền ngoài cùng (màu xanh nhạt) */}
        <Icons.QrBackground style={styles.svgBackground} />
        
        {/* Lớp nền trắng bên trong */}
        <Icons.QrForeground style={styles.svgForeground} />

        {/* Lớp nội dung nằm trên cùng */}
        <View style={styles.contentOverlay}>
            <TouchableOpacity onPress={() => setQrZoomed(true)}>
                <View style={styles.qrFrame}>
                    <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} resizeMode="contain" />
                </View>
            </TouchableOpacity>
            
            <View style={styles.bankInfoContainer}>
                <View>
                    <Text style={styles.bankInfoText}>Ngân hàng: {bankInfo.bankName}</Text>
                    <Text style={styles.bankInfoText}>STK: {bankInfo.accountNumber}</Text>
                    <Text style={styles.bankInfoText}>Chủ tài khoản: {bankInfo.accountName}</Text>
                </View>
                <TouchableOpacity onPress={() => copyToClipboard(bankInfo.accountNumber)}>
                    <Icons.Paste />
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={handleChooseImage}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.uploadButtonText}>Hóa đơn thanh toán</Text>}
            </TouchableOpacity>
        </View>
      </View>

      {/* Bill Upload Section */}
      <Text style={styles.sectionTitle}>Hóa đơn thanh toán</Text>
      {billImg ? (
        <View>
          <FastImage style={styles.billImage} source={{ uri: billImg }} resizeMode="cover" />
          <TouchableOpacity style={styles.changeBillButton} onPress={handleChooseImage}>
            <Text style={styles.changeBillText}>Thay đổi hóa đơn</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadPlaceholder} onPress={handleChooseImage}>
          <Icons.Camera1 />
        </TouchableOpacity>
      )}

      {/* QR Zoom Modal */}
      <Modal visible={qrZoomed} transparent={true} animationType="fade" onRequestClose={() => setQrZoomed(false)}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={() => setQrZoomed(false)}>
            <Image source={{ uri: qrCodeUrl }} style={styles.enlargedQrCode} resizeMode="contain" />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
        marginBottom: 12,
    },
    // SỬA ĐỔI: Style cho container chính và các lớp xếp chồng
    paymentCardContainer: {
        width: '100%',
        aspectRatio: 343 / 388, // Giữ đúng tỷ lệ của SVG nền
        justifyContent: 'center',
        alignItems: 'center',
    },
    svgBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    svgForeground: {
        position: 'absolute',
        width: '85%', // SVG trắng nhỏ hơn SVG nền
        height: '90%',
    },
    contentOverlay: {
        position: 'absolute',
        width: '85%',
        height: '90%',
        alignItems: 'center',
        justifyContent: 'space-between', // Dàn đều nội dung theo chiều dọc
        paddingVertical: 24, // Tăng padding để đẩy nội dung ra xa viền
        paddingHorizontal: 20,
    },
    qrFrame: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    qrCode: {
        width: 150,
        height: 150,
    },
    bankInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    bankInfoText: {
        fontSize: 14,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    uploadButton: {
        backgroundColor: Colors.blue,
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        width: '100%',
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    billImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: '#E0E0E0',
    },
    changeBillButton: {
        alignItems: 'center',
    },
    changeBillText: {
        color: Colors.blue,
        fontWeight: '500',
    },
    uploadPlaceholder: {
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.grayLight,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    enlargedQrCode: {
        width: 300,
        height: 300,
    },
});

export default QRCodePayment;