import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Modal from 'react-native-modal';
import { Icons } from '../assets';

interface WalletPasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  loading?: boolean;
}

const WalletPasswordModal: React.FC<WalletPasswordModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [password, setPassword] = useState('');
  const [isSecure, setIsSecure] = useState(true);

  const handleConfirm = () => {
    onConfirm(password);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onModalHide={() => {
        // Reset khi modal đã ẩn hoàn toàn
        setPassword('');
        setIsSecure(true);
      }}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.4}
      style={styles.modal}
    >
      <TouchableWithoutFeedback>
        <View style={styles.container}>
          <Text style={styles.title}>Xác nhận mật khẩu</Text>

          <View style={styles.inputContainer}>
            <View style={styles.icon}>
              <Icons.Password width={20} height={20} color="#8E8E93" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••••"
              placeholderTextColor="#BDBDBD"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={isSecure}
              autoFocus
            />
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setIsSecure(!isSecure)}
            >
              {isSecure ? (
                <Icons.Eyesplash width={20} height={20} color="#8E8E93" />
              ) : (
                <Icons.Eyes width={20} height={20} color="#8E8E93" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, (loading || !password.trim()) && styles.disabledButton]}
            onPress={handleConfirm}
            disabled={loading || !password.trim()}
          >
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

/* styles unchanged - paste lại styles của bạn ở đây */
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    height: 52,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  icon: {
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 30,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#AECBFA',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WalletPasswordModal;
