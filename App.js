import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SwipeStack from './src/components/swipeStack';
import Profile from './src/components/profile';

const Tab = createBottomTabNavigator();

const App = () => {
    return (
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Profile" component={Profile} />
            <Tab.Screen name="Swipe" component={SwipeStack} />
          </Tab.Navigator>
        </NavigationContainer>
      );
};

export default App;