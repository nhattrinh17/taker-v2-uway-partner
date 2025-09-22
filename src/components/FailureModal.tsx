import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, StatusBar, Animated, Easing } from 'react-native';
import { Fonts, Icons } from '../assets';
import { Colors } from '../assets/Colors';

interface FailureModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  message?: string | null;
  subMessage?: string;
}

const FailureModal: React.FC<FailureModalProps> = ({ visible, onClose, onContinue, message, subMessage }) => {
  return (
    <Modal transparent visible={visible} onRequestClose={onContinue}>
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar barStyle="dark-content" />

        <TouchableOpacity style={styles.backgroundOverlay} activeOpacity={1} onPress={onContinue}>
          {/* Modal Content */}
          <View style={[styles.modalContent]}>
            {/* Checkmark Icon */}
            <Icons.Failure />

            {/* Success Message */}
            <Text style={styles.successTitle}>{message}</Text>
            <Text style={styles.successSubtitle}>{subMessage}</Text>
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
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 4,
  },
  successTitle: {
    fontFamily: Fonts.fontFamily.LexendBold,
    fontSize: 14,
    color: Colors.black,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 12,
    color: Colors.black,
    textAlign: 'center',
    fontFamily: Fonts.fontFamily.LexendMedium,
  },
  continueButton: {
    backgroundColor: '#0066FF',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '90%',
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FailureModal;
