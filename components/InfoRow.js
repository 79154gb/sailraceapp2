// InfoRow.js

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const InfoRow = ({label, value}) => {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
    flexShrink: 1,
    flexBasis: '40%',
  },
  value: {
    flexShrink: 1,
    flexBasis: '60%',
  },
});

export default InfoRow;
