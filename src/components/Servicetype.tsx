// ServiceTile.tsx
import React from 'react';
import {Pressable, View, Text} from 'react-native';

type Props = {
  Icon: React.ComponentType<any>;
  label: string;
  onPress?: () => void;
};

export function ServiceTile({Icon, label, onPress}: Props) {
  return (
    <Pressable style={{width: 86, alignItems: 'center'}} onPress={onPress}>
      <View style={{width: 64, height: 64, position: 'relative'}}>
        {/* SVG đã chứa thẻ trắng + vòng tròn */}
        <Icon width={64} height={64} />

        {/* Chữ đè trong vùng trắng bên dưới vòng tròn */}
        <Text
          numberOfLines={1}
          style={{
            position: 'absolute',
            left: 4,
            right: 4,
            bottom: 6,             // chỉnh lên/xuống cho vừa mắt
            textAlign: 'center',
            fontSize: 12,
            color: '#0B1421',
            fontWeight: '500',
            zIndex: 1,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
