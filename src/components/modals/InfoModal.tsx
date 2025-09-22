import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Pressable, Platform } from 'react-native';
import { Colors } from '../../assets/Colors';
import { Fonts } from '../../assets/Fonts';

type InfoModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  primaryText?: string;
  onPrimaryPress?: () => void;
};

export default function InfoModal({
  visible,
  title,
  message,
  onClose,
  primaryText = 'Đóng',
  onPrimaryPress,
}: InfoModalProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      ]).start();
    } else {
      // Reset animation values when modal is closed
      fade.setValue(0);
      scale.setValue(0.92);
    }
  }, [visible, fade, scale]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Pressable style={sx.backdrop} onPress={onClose}>
        <Animated.View style={[sx.cardWrap, { opacity: fade, transform: [{ scale }] }]}>
          {/* Prevent closing when pressing on the card itself */}
          <Pressable style={sx.card}>
            {/* Title */}
            <Text style={sx.title}>{title}</Text>
            {/* Message */}
            <Text style={sx.message}>{message}</Text>

            {/* Primary button */}
            <TouchableOpacity
              style={sx.primaryBtn}
              onPress={onPrimaryPress || onClose} // Nếu không có onPrimaryPress thì mặc định là onClose
              activeOpacity={0.9}
            >
              <Text style={sx.primaryBtnText}>{primaryText}</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const sx = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardWrap: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    color: '#1F2937', // Màu tiêu đề trung tính
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontSize: Platform.select({ ios: 18, android: 17 })!,
    marginBottom: 8,
  },
  message: {
    marginBottom: 20,
    color: '#4B5563',
    textAlign: 'center',
    fontFamily: Fonts.fontFamily.LexendRegular,
    fontSize: 14,
    lineHeight: 21,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    color: Colors.white,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontSize: 15,
  },
});