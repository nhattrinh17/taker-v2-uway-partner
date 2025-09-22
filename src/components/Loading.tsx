import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BallIndicator ,SkypeIndicator} from 'react-native-indicators';
import { Colors } from '../assets/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '100%',
  },
  animation: {
    width: 300,
    height: 300
  }
});

const Loading = () => {
  return (
    <View style={styles.container}>
      <SkypeIndicator  color={Colors.white} size={50} animationDuration={1200} />
    </View>
  );
};

export default Loading;
