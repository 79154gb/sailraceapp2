import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const CustomButton = ({title, onPress, style, textStyle}) => (
  <TouchableOpacity style={[buttonStyles.button, style]} onPress={onPress}>
    <Text style={[buttonStyles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff', // Default button color
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff', // Default text color
    fontSize: 11, // Default font size
  },
});

export default CustomButton;
