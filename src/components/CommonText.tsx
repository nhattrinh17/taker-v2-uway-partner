import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Colors } from '../assets/Colors';
import { Fonts } from '../assets/Fonts';

const style = StyleSheet.create({
  text: {
    fontSize: Fonts.fontSize[12],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.black,
    fontWeight: '400',
    flexWrap: 'wrap',
    width: '100%',
    //textAlign: 'center',
  },
});

interface TextProps {
  text: string;
  color?: string;
  styles?: StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

const CommonText = (props: TextProps) => {
  const { text, color = Colors.black, styles = {}, numberOfLines, ellipsizeMode } = props;
  return (
    <Text allowFontScaling={false} style={[style.text, { color }, styles]} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>
      {text || ''}
    </Text>
  );
};

export default CommonText;
