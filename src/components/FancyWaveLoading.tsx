// FancyWaveLoading.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { Colors } from '../assets/Colors';

const Dot = ({ delay, color }: { delay: number; color: string }) => {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    // Tạo một animation cycle với timing tổng = 750ms (250*3)
    const animationCycle = withRepeat(
      withTiming(-10, {
        duration: 250,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    // Delay trước khi bắt đầu animation
    if (delay > 0) {
      translateY.value = withDelay(delay, animationCycle);
    } else {
      translateY.value = animationCycle;
    }
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, animatedStyle, { backgroundColor: color }]} />;
};

const FancyWaveLoading = () => {
  return (
    <View style={styles.container}>
      <Dot delay={0} color={Colors.green} />
      <Dot delay={150} color={'yellow'} />
      <Dot delay={300} color={Colors.red} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 7,
    backgroundColor: '#00BFFF',
    marginHorizontal: 4,
  },
});

export default FancyWaveLoading;