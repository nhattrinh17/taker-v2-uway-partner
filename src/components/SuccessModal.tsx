import React, { useEffect, useMemo, useRef } from 'react';
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
import { Icons } from '../assets';

type SuccessModalProps = {
  visible: boolean;
  title?: string;
  message?: string;
  icon?: React.ReactNode;                 // ví dụ: <icons.Success width={80} height={80} />
  autoCloseMs?: number;                   // tự đóng sau X ms (tuỳ chọn)
  onClose?: () => void;                   // đóng khi bấm ra ngoài / tự đóng
  primaryText?: string;                   // nếu muốn thêm nút OK
  onPrimaryPress?: () => void;
  footerText?: string;                    // ví dụ: "Bạn chưa nhận được mã ?"
  onPress?: () => void;
  onContinue?: () => void;
};

export default function SuccessModal({
  visible,
  title = 'Thành công',
  message,
  icon,
  autoCloseMs,
  onClose,
  primaryText,
  onPrimaryPress,
  onPress,
  onContinue,
}: SuccessModalProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      ]).start();
    } else {
      fade.setValue(0);
      scale.setValue(0.92);
    }
  }, [visible, fade, scale]);

  useEffect(() => {
    if (!visible || !autoCloseMs) return;
    const t = setTimeout(() => {
      onClose?.();
    }, autoCloseMs);
    return () => clearTimeout(t);
  }, [visible, autoCloseMs, onClose]);

  const dots = useMemo(
    () =>
      [ {top:18,left:34,size:6}, {top:10,right:32,size:5}, {bottom:16,left:28,size:5},
        {bottom:24,right:36,size:6}, {top:30,right:78,size:4} ],
    []
  );

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Pressable style={sx.backdrop} onPress={onClose}>
        <Animated.View style={[sx.cardWrap, { opacity: fade, transform: [{ scale }] }]}>
          {/* Dots trang trí */}
          {dots.map((d, i) => (
            <View key={i} style={[sx.dot, d as any, { width: d.size, height: d.size, borderRadius: d.size }]} />
          ))}

          <View style={sx.card}>
            {/* Icon */}
            <View style={sx.iconWrap}>{icon || <Icons.SuccessIcon width={160} height={120} />}</View>
            {/* Title */}
            <Text style={sx.title}>{title}</Text>
            {/* Message */}
            {message ? <Text style={sx.message}>{message}</Text> : null}

            {/* Optional primary button */}
            {primaryText ? (
              <TouchableOpacity
                style={sx.primaryBtn}
                onPress={onPrimaryPress}
                activeOpacity={0.9}
              >
                <Text style={sx.primaryBtnText}>{primaryText}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const sx = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iconWrap: {
    marginTop: 4,
    marginBottom: 8,
  },
  title: {
    color: Colors.blue,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontSize: Platform.select({ ios: 18, android: 17 })!,
    marginTop: 4,
  },
  message: {
    marginTop: 8,
    color: '#4B5563',
    textAlign: 'center',
    fontFamily: Fonts.fontFamily.LexendRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 16,
    minWidth: 160,
    height: 44,
    borderRadius: 22,
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
  dot: {
    position: 'absolute',
    backgroundColor: Colors.blue,
    opacity: 0.9,
  },
});
