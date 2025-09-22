import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import { Colors } from '../assets/Colors';
import { Fonts, Icons } from '../assets';

interface WarningCancelProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const WarningCancel = ({ isVisible, onClose, onConfirm }: WarningCancelProps) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal} useNativeDriver hideModalContentWhileAnimating>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icons.Warning width={20} height={20} style={styles.icon} />
          <Text style={styles.title}>Bạn có chắc chắn muốn huỷ</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
            <Text style={styles.buttonCancelText}>Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonConfirm} onPress={onConfirm}>
            <Text style={styles.buttonConfirmText}>Tiếp tục hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WarningCancel;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
    tintColor: Colors.black,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.fontFamily.LexendBold,
    color: Colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  buttonCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
  },
  buttonCancelText: {
    color: Colors.black,
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendMedium,
  },
  buttonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  buttonConfirmText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.fontFamily.LexendMedium,
  },
});
