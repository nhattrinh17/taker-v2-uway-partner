import { Colors } from '../assets/Colors';
import { Fonts } from '../assets';
import React, { ReactElement, ReactNode } from 'react';
import {Text, StyleSheet, TextStyle, TouchableOpacity, ViewStyle, Dimensions, StyleProp } from 'react-native';
import CommonText from './CommonText';
import { BallIndicator } from 'react-native-indicators';

const style = StyleSheet.create({
  text: {
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontWeight: '600',
    color: Colors.white,
    alignItems: 'center',
    textAlign: 'center',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  linear: {
    height: 48,
    borderRadius: 30,
    width: Dimensions.get('screen').width - 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#0B96DF',
  },
  textStatus: {
    fontSize: Fonts.fontSize[14],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.main,
    fontWeight: '500',
  },
});

interface ButtonProps {
  text: string;
  color?: string;
  textStyles?: TextStyle;
  buttonStyles?: StyleProp<ViewStyle>;
  onPress: () => void | Promise<void>;
  isDisable?: boolean;
  backgroundColor?: string;
  children?: ReactElement | ReactNode;
  isLoading?: boolean;
}

const CommonButton = (props: ButtonProps) => {
  const { text, textStyles = {}, onPress, isDisable = false, buttonStyles = {}, children, isLoading = false } = props;

  const backgroundColor = isLoading || isDisable ? Colors.mainDisable : Colors.main;
  const color = isDisable ? Colors.nobel : Colors.white;

  return (
    <TouchableOpacity onPress={(!isDisable && !isLoading) ? onPress : undefined} disabled={isDisable || isLoading} style={[style.linear, { backgroundColor }, buttonStyles]}>
      {children && children}
      {isLoading ? <BallIndicator size={24} color={Colors.main} animationDuration={600} /> : <CommonText styles={{ ...style.text, color, ...textStyles }} text={text || ''} />}
    </TouchableOpacity>
  );
};

export default CommonButton;
