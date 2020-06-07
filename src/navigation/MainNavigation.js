import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// react-natvigation 라이브러리 에서 StackNavigator 추가하기
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
// MainScreen 추가
import MainScreen from '../screens/MainScreen';

const AppStack = createStackNavigator({
    Main: {
        screen: MainScreen
    }
});

export default createAppContainer(createSwitchNavigator(
    {
        App: AppStack
    }
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});