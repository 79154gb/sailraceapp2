import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';

const InfoRow = ({iconName, label, value, style}) => (
  <View style={styles.infoItem}>
    <Icon name={iconName} size={20} color="black" />
    <Text style={[styles.infoText, style]}>{`${label}: ${value}`}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 12,
  },
});

export default InfoRow;
