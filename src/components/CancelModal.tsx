import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, StatusBar, Animated, Easing, ViewStyle } from 'react-native';
import { Fonts, Icons } from '../assets';
import { Colors } from '../assets/Colors';

interface CancelModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  loading?: boolean;
  message?: string;
  subMessage?: string;
  textBtn?: string;
  colorBtn?: string;
  qrCode?: React.ReactNode;
}

const CancelModal: React.FC<CancelModalProps> = ({ visible, onClose, onContinue, loading = false, message, subMessage, textBtn, colorBtn, qrCode }) => {
  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar barStyle="dark-content" />
        <TouchableOpacity style={styles.backgroundOverlay} activeOpacity={1} onPress={onClose}>
          {/* Modal Content */}
          <View style={[styles.modalContent]}>
            <Text style={styles.successTitle}>{message}</Text>
            {/* {qrCode && qrCode} */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 10 }}>
              <TouchableOpacity style={styles.btnBack} onPress={onClose}>
                <Text style={styles.textBtnBack}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnCancel, (textBtn == 'Xác nhận' || textBtn == 'Tiếp tục' || textBtn == 'Bắt đầu' )|| colorBtn ? { backgroundColor: Colors.main, paddingHorizontal: 30 } : '']} onPress={onContinue}>
                <Text style={styles.textBtnBack}>{textBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backgroundOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 10,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successTitle: {
    fontFamily: Fonts.fontFamily.LexendBold,
    fontSize: 14,
    color: Colors.black,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.black,
    textAlign: 'center',
    fontFamily: Fonts.fontFamily.LexendMedium,
  },
  continueButton: {},
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  btnBack: {
    backgroundColor: Colors.main,
    borderRadius: 25,
    paddingVertical: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '45%',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: Colors.red,
    borderRadius: 25,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '45%',
    alignItems: 'center',
  },
  textBtnBack: {
    color: 'white',
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    alignItems: 'center',
    fontSize: 12,
  },
});

export default CancelModal;
