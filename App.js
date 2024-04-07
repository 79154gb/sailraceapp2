import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import SailboatCategoriesScreen from './screens/SailboatCategoriesScreen';
import DinghyManufacturerScreen from './screens/DinghyManufacturerScreen';
import DinghyModelsScreen from './screens/DinghyModelsScreen';
import RaceSetupScreen from './screens/RaceSetupScreen';
import RaceCourseScreen from './screens/RaceCourseScreen'; // Import the new screen
import RaceOverviewScreen from './screens/RaceOverviewScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="SailboatCategories"
          component={SailboatCategoriesScreen}
        />
        <Stack.Screen
          name="DinghyManufacturer"
          component={DinghyManufacturerScreen}
          options={{title: 'Dinghy Manufacturer'}}
        />
        <Stack.Screen
          name="DinghyModels"
          component={DinghyModelsScreen}
          options={{title: 'Dinghy Models'}}
        />
        <Stack.Screen
          name="RaceSetup"
          component={RaceSetupScreen}
          options={{title: 'Race Setup'}}
        />
        <Stack.Screen
          name="RaceCourse"
          component={RaceCourseScreen}
          options={{title: 'Select Course'}}
        />
        <Stack.Screen name="RaceOverview" component={RaceOverviewScreen} />
        {/* Add more screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
