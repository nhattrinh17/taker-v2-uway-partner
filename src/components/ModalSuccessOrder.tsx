import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icons } from '../assets';

interface Props {
  visible: boolean;
  onClose: () => void;
  onTrackOrder: () => void;
}

const ModalSuccessOrder: React.FC<Props> = ({ visible, onClose, onTrackOrder }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon check */}
          <View style={styles.iconCircle}>
            <Icons.SuccessIcon width={160} height={120}/>
          </View>

          {/* Tiêu đề */}
          <Text style={styles.title}>Đóng gói thành công</Text>

          {/* Nội dung */}
          <Text style={styles.message}>
            Đơn hàng sẽ được Uway đến nhận trong thời gian ngắn.
          </Text>

          {/* Nút hành động */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.trackBtn]} onPress={onTrackOrder}>
              <Text style={[styles.buttonText, { color: '#0094ff' }]}>Theo dõi đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.homeBtn]} onPress={onClose}>
              <Text style={styles.buttonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalSuccessOrder;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iconCircle: {
    backgroundColor: '#0094ff',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0094ff',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
  },
  trackBtn: {
    backgroundColor: '#eaf6ff',
  },
  homeBtn: {
    backgroundColor: '#0094ff',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
});
