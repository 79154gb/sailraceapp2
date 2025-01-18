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
  getkeelboatPolars,
  getUserKeelBoatPolars,
  updateUserKeelBoatPolars,
} from '../api/api'; // Ensure these functions are properly defined in your API file
import BoatPolarsComponent from '../components/BoatPolarsComponent';

const KeelboatPolarsScreen = ({route, navigation}) => {
  const {userId, manufacturer, model, model_id} = route.params;
  const [polars, setPolars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Orientation.lockToLandscape();

    const fetchPolars = async () => {
      try {
        // Try fetching user-specific polars using the correct method
        let data = await getUserKeelBoatPolars(userId, manufacturer, model);

        // If no user-specific polars, fallback to fetching the default keelboat polars
        if (!data || data.length === 0) {
          data = await getkeelboatPolars(manufacturer, model);
        }

        if (!data || data.length === 0) {
          // If neither user-specific nor default polars exist, initialize with empty data
          data = [
            {label: 'Wind Speed', values: ['', '', '', '', '', '', '']},
            {label: 'Beat Angle', values: ['', '', '', '', '', '', '']},
            {label: 'Beat VMG', values: ['', '', '', '', '', '', '']},
            {label: '52', values: ['', '', '', '', '', '', '']},
            {label: '60', values: ['', '', '', '', '', '', '']},
            {label: '75', values: ['', '', '', '', '', '', '']},
            {label: '90', values: ['', '', '', '', '', '', '']},
            {label: '110', values: ['', '', '', '', '', '', '']},
            {label: '120', values: ['', '', '', '', '', '', '']},
            {label: '135', values: ['', '', '', '', '', '', '']},
            {label: '150', values: ['', '', '', '', '', '', '']},
            {label: 'Run Angle', values: ['', '', '', '', '', '', '']},
            {label: 'Run VMG', values: ['', '', '', '', '', '', '']},
            {label: 'Gybe Angle', values: ['', '', '', '', '', '', '']},
          ];
        } else {
          // If data exists, format it as necessary
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
              label: '75',
              values: data.map(d =>
                d.twa_75 !== null ? d.twa_75.toString() : '',
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
              label: 'Run VMG',
              values: data.map(d =>
                d.run_vmg !== null ? d.run_vmg.toString() : '',
              ),
            },
            {
              label: 'Gybe Angle',
              values: data.map(d =>
                d.gybe_angle !== null ? d.gybe_angle.toString() : '',
              ),
            },
          ];
        }

        // Ensure each row has 7 values for display consistency
        data = data.map(row => ({
          label: row.label,
          values:
            row.values.length === 7
              ? row.values
              : [...row.values, '', '', '', '', '', ''].slice(0, 7),
        }));

        setPolars(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching keelboat polars:', error);
        setLoading(false);
      }
    };

    fetchPolars();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [userId, manufacturer, model]);

  const handleUpdate = async updatedPolars => {
    try {
      const formattedPolars = updatedPolars.map(polar => ({
        label: polar.label,
        manufacturer, // Ensure manufacturer is included here
        model_name: model,
        model_id,
        user_id: userId,
        values: polar.values.map(value =>
          value === '' ? null : parseFloat(value),
        ),
      }));

      console.log('Updating polars with:', {userId, model_id, formattedPolars});

      await updateUserKeelBoatPolars(userId, model_id, formattedPolars);
      Alert.alert('Success', 'Keelboat polars updated successfully');
    } catch (error) {
      console.error('Failed to update keelboat polars:', error);
      Alert.alert('Error', 'Failed to update keelboat polars');
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
      <Text style={styles.header}>Keelboat Polars</Text>
      <BoatPolarsComponent polars={polars} onPolarsChange={setPolars} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleUpdate(polars)}>
          <Text style={styles.buttonText}>Save Keelboat Polars</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('RaceOverviewScreen', {
              boatPolars: polars,
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
    backgroundColor: '#37414f',
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
    color: '#EAECEC',
    fontWeight: 'normal',
    textAlign: 'center',
  },
});

export default KeelboatPolarsScreen;
