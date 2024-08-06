import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, Alert} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {uploadActivity} from '../api/api'; // Ensure this function is correctly defined in your API file

const UploadActivityScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const [file, setFile] = useState(null);

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      setFile(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Canceled');
      } else {
        console.error('Unknown Error: ', err);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('No file selected', 'Please select a file first');
      return;
    }

    try {
      await uploadActivity(userId, file);
      Alert.alert('Success', 'Activity uploaded successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to upload activity:', error);
      Alert.alert('Error', 'Failed to upload activity');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Upload Activity</Text>
      <Button title="Select File" onPress={selectFile} />
      {file && <Text style={styles.fileName}>{file.name}</Text>}
      <Button title="Upload" onPress={handleUpload} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 24,
    marginBottom: 20,
  },
  fileName: {
    marginTop: 20,
    fontSize: 16,
    marginBottom: 20,
  },
});

export default UploadActivityScreen;
