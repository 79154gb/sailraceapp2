import React from 'react';
import {View, StyleSheet} from 'react-native';
import CustomButton from './CustomButton';

const TimerControls = ({
  timerMinutes,
  setTimerMinutes,
  timerRunning,
  startTimer,
  resetTimer,
}) => (
  <View style={styles.timerControls}>
    <CustomButton
      title="Set Timer"
      onPress={() => setTimerMinutes(timerMinutes < 10 ? timerMinutes + 1 : 1)}
    />
    <CustomButton
      title={timerRunning ? 'Stop Timer' : 'Start Timer'}
      onPress={timerRunning ? resetTimer : startTimer}
    />
    <CustomButton title="Reset Timer" onPress={resetTimer} />
  </View>
);

const styles = StyleSheet.create({
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
});

export default TimerControls;
