// src/components/ConfirmActionSheet.tsx
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
  Platform,
} from 'react-native';
import { Colors } from '../assets/Colors';
import { Fonts } from '../assets/Fonts';

type Props = {
  visible: boolean;
  title?: string;
  dangerText?: string;          // ví dụ: "Đăng xuất"
  cancelText?: string;          // ví dụ: "Huỷ"
  onDangerPress?: () => void;
  onCancel?: () => void;        // bấm Huỷ
  onClose?: () => void;         // chạm ra ngoài
};

export default function ConfirmActionSheet({
  visible,
  title = 'Xác nhận',
  dangerText = 'OK',
  cancelText = 'Huỷ',
  onDangerPress,
  onCancel,
  onClose,
}: Props) {
  const slide = useRef(new Animated.Value(0)).current; // 0 -> 1
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 160, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(slide, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(0);
    }
  }, [visible, fade, slide]);

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Pressable style={sx.backdrop} onPress={onClose}>
        <Animated.View style={[sx.sheetWrap, { opacity: fade, transform: [{ translateY }] }]}>
          <View style={sx.sheet}>
            <Text style={sx.title}>{title}</Text>

            <TouchableOpacity style={sx.row} onPress={onDangerPress} activeOpacity={0.8}>
              <Text style={sx.rowDanger}>{dangerText}</Text>
            </TouchableOpacity>

            <View style={sx.divider} />

            <TouchableOpacity style={[sx.row, { borderBottomWidth: 0 }]} onPress={onCancel} activeOpacity={0.8}>
              <Text style={sx.rowCancel}>{cancelText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const sx = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    overflow: 'hidden',
  },
  title: {
    textAlign: 'center',
    color: Colors.textPrimary,
    fontFamily: Fonts.fontFamily.LexendRegular,
    fontSize: Platform.select({ ios: 15, android: 14 })!,
    paddingVertical: 8,
  },
  divider: { height: 8, backgroundColor: Colors.seaShell },
  row: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowDanger: {
    color: Colors.flamingo,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontSize: 15,
  },
  rowCancel: {
    color: Colors.textPrimary,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontSize: 15,
  },
});
