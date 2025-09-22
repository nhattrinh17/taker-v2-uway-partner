// ToastConfig.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast, { BaseToastProps } from 'react-native-toast-message';
import { Colors } from '../assets/Colors';
import { Fonts } from '../assets';

export const toastConfig = {
  errorTouchable: ({ text2, props }: BaseToastProps) => (
    <TouchableOpacity
      onPress={() => {
        Toast.hide();
        props?.onPress?.(); // Gọi callback được truyền vào
      }}
      style={{
        backgroundColor: Colors.white,
        padding: 10,
        borderLeftColor: props?.color,
        borderLeftWidth: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        paddingVertical: 15,
        width: '90%',
      }}>
      <Text style={{ color: Colors.black, fontFamily: Fonts.fontFamily.LexendBold, fontSize: 14, paddingBottom: 5 }}>🔔 Thông báo</Text>
      <Text style={{ color: Colors.black, fontFamily: Fonts.fontFamily.LexendRegular, fontSize: 12 }}>{text2}</Text>
    </TouchableOpacity>
  ),
};
