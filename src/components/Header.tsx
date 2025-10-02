import { Colors } from '../assets/Colors';
import { Fonts } from '../assets';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import CommonText from './CommonText';
import { Icons } from '../assets';
import { goBack } from '../navigation/utils/navigationUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const style = StyleSheet.create({
  text: {
    fontSize: Fonts.fontSize[24],
    fontFamily: Fonts.fontFamily.LexendBold,
    color: Colors.black,
    lineHeight: 24,
    fontWeight: '700',
    marginTop: 18,
    flex: 1,
    textAlign: 'center'
  },
  wrapperHeader: {
    flexDirection: 'row',
    width: screenWidth,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    zIndex: 999,
    ...Platform.select({
      android: {
        // paddingTop: 40,
      },
    }),
  },
  empty: {
    width: 25,
  },
  safeArea: {
    backgroundColor: Colors.white,
    zIndex: 1999,
  },
  btBack: {
    width: 25,
    marginLeft: 5,
    marginTop: 15,
  },
  shadow: {
    //   backgroundColor: 'white', // Bắt buộc phải có màu nền để shadow hiện
    // shadowColor: '#22313F',
    // shadowOffset: {
    //   width: 0,
    //   height: 6, // Càng lớn thì shadow càng thấp xuống
    // },
    // shadowOpacity: 0.15, // Cường độ bóng
    // shadowRadius: 6, // Độ mờ của bóng
    // elevation: 6, // Android: độ cao bóng
  },
});

interface HeaderProps {
  title?: string;
  onPress?: () => void;
  hideIconBack?: boolean;
  shadow?: boolean;
}

const Header = (props: HeaderProps) => {
  const { top } = useSafeAreaInsets();
  const { title = '', onPress, hideIconBack = false, shadow = true } = props;
  const headerStyle = [style.wrapperHeader, shadow && style.shadow];
  const onPressBack = () => {
    if (onPress) {
      return onPress();
    }
    goBack();
  };
  return (
    <View style={{ marginBottom: 15, }}>
      <Shadow
        startColor={shadow ? '#00000010' : '#00000000'}
        offset={[0, 5]} // chỉ shadow dưới
        distance={5} // độ lan
      >
        <View style={[headerStyle, { justifyContent: 'center' }]}>
          <TouchableOpacity onPress={onPressBack} style={[style.btBack]}>
            {hideIconBack ? null : <Icons.Backbutton />}
          </TouchableOpacity>
          <CommonText text={title} styles={[style.text, { flex: 1, textAlign: 'center' }]} />
          <View style={style.empty} />
        </View>
      </Shadow>
    </View>
  );
};

export default Header;
