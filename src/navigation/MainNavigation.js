import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// react-natvigation 라이브러리 에서 StackNavigator 추가하기
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// MainScreen 추가
import TabNavigation from './TabNavigation';
import MainScreen from '../screens/MainScreen'

const AppStack = createStackNavigator();

export default function MainNavigation() {
  return(
    <NavigationContainer>
      <AppStack.Navigator
        initialRouteName="Main"
      >
        <AppStack.Screen name="Main" component={TabNavigation} />
        <AppStack.Screen name="Details" component={MainScreen} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
}