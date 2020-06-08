import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Text, View } from 'react-native';

import MainScreen from '../screens/MainScreen';

import HomeTab from '../screens/HomeTab';
import BestGoodsTab from '../screens/BestGoodsTab';
import CategoryTab from '../screens/CategoryTab';
import UserTab from '../screens/UserTab';


const Tab = createBottomTabNavigator();

export default function TabNavigation() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeTab} />
            <Tab.Screen name="Best" component={BestGoodsTab} />
            <Tab.Screen name="Category" component={CategoryTab} />
            <Tab.Screen name="User" component={UserTab} />
        </Tab.Navigator>
    ); 
}