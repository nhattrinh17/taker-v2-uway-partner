import React from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Stop, Path} from 'react-native-svg';

type StopDef = { offset: number; color: string; opacity?: number };

export default function Wave({
  height,
  stops,
  rotate = 0,
  style,
}: {
  height: number;
  stops: StopDef[];            // các điểm màu gradient
  rotate?: number;             // -0.16° theo Figma (không bắt buộc)
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{position:'absolute', top:0, left:0, right:0, height}, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 430 475"          // từ SVG Figma bạn gửi
        preserveAspectRatio="none"
        style={{transform:[{rotate: `${rotate}deg`}]}}

      >
        <Defs>
          <LinearGradient
            id="grad"
            x1="-757.772" y1="235.531"   // giữ đúng hệ tọa độ Figma
            x2="1051.17"  y2="240.603"
            gradientUnits="userSpaceOnUse"
          >
            {stops.map((s, i) => (
              <Stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity ?? 1} />
            ))}
          </LinearGradient>
        </Defs>

        {/* PATH lấy nguyên từ SVG Figma của bạn (stroke + strokeWidth=310) */}
        <Path
          d="M-758 317.029C-758 317.029 -486.234 153.427 -288.45 155.323C-94.4473 157.183 -24.2789 321.82 169.715 319.63C356.336 317.523 421.632 157.977 608.271 157.837C796.712 157.696 1050.94 322.101 1050.94 322.101"
          stroke="url(#grad)"
          strokeWidth={310}
          fill="none"
        />
      </Svg>
    </View>
  );
}
