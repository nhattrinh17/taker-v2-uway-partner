import React, { useState } from 'react';
import { Modal, TouchableWithoutFeedback, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../assets/Colors';
import { Fonts } from '../assets/Fonts';
import { Icons } from '../assets/icons';
import { styles as authStyles } from '../modules/auth/authStyles';

interface WalletPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  password: string;
  onPasswordChange: (password: string) => void;

  loading?: boolean;
}

const WalletPasswordModal: React.FC<WalletPasswordModalProps> = ({
  visible,
  onClose,
  onConfirm,
  password,
  onPasswordChange,

  loading = false,
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const onToggleSecure = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.container}>
              <Text style={styles.title}>Nhập mật khẩu ví Xiin</Text>

              <View style={[authStyles.inputContainer, styles.inputContainer]}>
                <TextInput style={authStyles.input} placeholder="Mật khẩu" placeholderTextColor={Colors.textPrimary} value={password} onChangeText={onPasswordChange} secureTextEntry={secureTextEntry} />
                <TouchableOpacity style={authStyles.deleteButton} onPress={onToggleSecure}>
                  {password && (secureTextEntry ? <Icons.Eyes /> : <Icons.Eyesplash />)}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.confirmButton, loading && styles.disabledButton]} onPress={onConfirm} disabled={loading || !password.trim()}>
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: Colors.main,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    elevation: 10,
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: Colors.mainLight,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
  },
});

export default WalletPasswordModal;
