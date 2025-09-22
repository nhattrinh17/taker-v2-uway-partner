// dùng cho chấm trang
import React from 'react';
import {View, StyleSheet} from 'react-native';

export default function DotIndicator({count, index}:{count:number; index:number}) {
  return (
    <View style={s.row}>
      {Array.from({length: count}).map((_, i) => (
        <View key={i} style={[s.dot, i===index && s.active]} />
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  row:{flexDirection:'row',gap:8,justifyContent:'center',alignItems:'center'},
  dot:{width:8,height:8,borderRadius:4,backgroundColor:'#E5E7EB'},
  active:{width:16,backgroundColor:'#3B82F6'},
});
