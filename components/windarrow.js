// WindArrow.js

import React from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import Svg, {Path} from 'react-native-svg';

const WindArrow = ({windDirection}) => {
  const rotation = windDirection + 180; // Adjust to ensure arrow points from wind direction

  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  // Animate the rotation
  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: rotation,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [rotation, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const arrowStyle = {
    transform: [{rotate: rotateInterpolate}],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={arrowStyle}>
        <Svg width={40} height={40} viewBox="0 0 64 64">
          <Path
            d="M32 0 L24 24 H40 L32 0 Z M32 64 V24 H28 V64 H32 Z"
            fill="#000"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WindArrow;
