import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import SailboatCategoriesScreen from './screens/SailboatCategoriesScreen';
import DinghyManufacturerScreen from './screens/DinghyManufacturerScreen';
import DinghyModelsScreen from './screens/DinghyModelsScreen';
import UserBoatDetailsScreen from './screens/UserBoatDetailsScreen';
import RaceOverviewScreen from './screens/RaceOverviewScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import BoatPolarsScreen from './screens/BoatPolarsScreen';
import YourBoatShedScreen from './screens/YourBoatShedScreen'; // Import the new screen

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
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
          name="BoatPolarsScreen"
          component={BoatPolarsScreen}
          options={{title: 'Boat Polars'}}
        />
        <Stack.Screen
          name="UserBoatDetailsScreen"
          component={UserBoatDetailsScreen}
          options={{title: 'Boat Details'}}
        />
        <Stack.Screen
          name="YourBoatShedScreen"
          component={YourBoatShedScreen}
          options={{title: 'Your Boat Shed'}}
        />
        <Stack.Screen
          name="RaceOverviewScreen"
          component={RaceOverviewScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
