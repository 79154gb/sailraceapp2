import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation-locker';
import {
  getBoatPolars,
  getUserBoatPolars,
  updateUserBoatPolars,
} from '../api/api';
import BoatPolarsComponent from '../components/BoatPolarsComponent';

const BoatPolarsScreen = ({route, navigation}) => {
  const {userId, manufacturer, model, model_id} = route.params;
  const [polars, setPolars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Orientation.lockToLandscape();

    const fetchPolars = async () => {
      try {
        let data = await getUserBoatPolars(userId, manufacturer, model);
        if (!data || data.length === 0) {
          data = await getBoatPolars(manufacturer, model);
        }
        if (!data || data.length === 0) {
          data = [
            {label: 'Wind Speed', values: ['', '', '', '', '', '', '']},
            {label: 'Beat Angle', values: ['', '', '', '', '', '', '']},
            {label: 'Beat VMG', values: ['', '', '', '', '', '', '']},
            {label: '52', values: ['', '', '', '', '', '', '']},
            {label: '60', values: ['', '', '', '', '', '', '']},
            {label: '70', values: ['', '', '', '', '', '', '']},
            {label: '75', values: ['', '', '', '', '', '', '']},
            {label: '80', values: ['', '', '', '', '', '', '']},
            {label: '90', values: ['', '', '', '', '', '', '']},
            {label: '110', values: ['', '', '', '', '', '', '']},
            {label: '120', values: ['', '', '', '', '', '', '']},
            {label: '135', values: ['', '', '', '', '', '', '']},
            {label: '150', values: ['', '', '', '', '', '', '']},
            {label: '165', values: ['', '', '', '', '', '', '']},
            {label: '180', values: ['', '', '', '', '', '', '']},
            {label: 'Run Angle', values: ['', '', '', '', '', '', '']},
            {label: 'Run VMG', values: ['', '', '', '', '', '', '']},
          ];
        } else {
          data = [
            {
              label: 'Wind Speed',
              values: data.map(d => d.wind_speed.toString()),
            },
            {
              label: 'Beat Angle',
              values: data.map(d =>
                d.beat_angle !== null ? d.beat_angle.toString() : '',
              ),
            },
            {
              label: 'Beat VMG',
              values: data.map(d =>
                d.beat_vmg !== null ? d.beat_vmg.toString() : '',
              ),
            },
            {
              label: '52',
              values: data.map(d =>
                d.twa_52 !== null ? d.twa_52.toString() : '',
              ),
            },
            {
              label: '60',
              values: data.map(d =>
                d.twa_60 !== null ? d.twa_60.toString() : '',
              ),
            },
            {
              label: '70',
              values: data.map(d =>
                d.twa_70 !== null ? d.twa_70.toString() : '',
              ),
            },
            {
              label: '75',
              values: data.map(d =>
                d.twa_75 !== null ? d.twa_75.toString() : '',
              ),
            },
            {
              label: '80',
              values: data.map(d =>
                d.twa_80 !== null ? d.twa_80.toString() : '',
              ),
            },
            {
              label: '90',
              values: data.map(d =>
                d.twa_90 !== null ? d.twa_90.toString() : '',
              ),
            },
            {
              label: '110',
              values: data.map(d =>
                d.twa_110 !== null ? d.twa_110.toString() : '',
              ),
            },
            {
              label: '120',
              values: data.map(d =>
                d.twa_120 !== null ? d.twa_120.toString() : '',
              ),
            },
            {
              label: '135',
              values: data.map(d =>
                d.twa_135 !== null ? d.twa_135.toString() : '',
              ),
            },
            {
              label: '150',
              values: data.map(d =>
                d.twa_150 !== null ? d.twa_150.toString() : '',
              ),
            },
            {
              label: '165',
              values: data.map(d =>
                d.twa_165 !== null ? d.twa_165.toString() : '',
              ),
            },
            {
              label: '180',
              values: data.map(d =>
                d.twa_180 !== null ? d.twa_180.toString() : '',
              ),
            },
            {
              label: 'Run Angle',
              values: data.map(d =>
                d.run_angle !== null ? d.run_angle.toString() : '',
              ),
            },
            {
              label: 'Run VMG',
              values: data.map(d =>
                d.run_vmg !== null ? d.run_vmg.toString() : '',
              ),
            },
          ];
        }
        // Ensure each row has exactly 7 values
        data = data.map(row => ({
          label: row.label,
          values:
            row.values.length === 7
              ? row.values
              : [...row.values, '', '', '', '', '', '', ''].slice(0, 7),
        }));
        setPolars(data);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching boat polars:', error);
        setLoading(false);
      }
    };

    fetchPolars();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [manufacturer, model, userId]);

  const handleUpdate = async updatedPolars => {
    try {
      const formattedPolars = updatedPolars.map(polar => ({
        label: polar.label,
        manufacturer,
        model_name: model,
        model_id,
        user_id: userId,
        values: polar.values.map(value =>
          value === '' ? null : parseFloat(value),
        ),
      }));

      console.log('Updating polars with:', {userId, model_id, formattedPolars});

      await updateUserBoatPolars(userId, model_id, formattedPolars);
      Alert.alert('Success', 'Boat polars updated successfully');
    } catch (error) {
      console.error('Failed to update boat polars:', error);
      Alert.alert('Error', 'Failed to update boat polars');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000']}
        style={styles.background}
      />
      <Text style={styles.header}>Boat Polars</Text>
      <BoatPolarsComponent polars={polars} onPolarsChange={setPolars} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleUpdate(polars)}>
          <Text style={styles.buttonText}>Save Boat Polars</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('RaceOverviewScreen', {
              userId,
              manufacturer,
              model,
              model_id,
            })
          }>
          <Text style={styles.buttonText}>Proceed to Race Overview</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#222831',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAECEC',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#37414f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#9af4fd',
    fontWeight: 'normal',
    textAlign: 'center',
  },
});

export default BoatPolarsScreen;
