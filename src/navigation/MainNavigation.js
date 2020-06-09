import React from 'react';
import { TouchableOpacity, View, Image, Alert } from 'react-native';
// react-natvigation 라이브러리 에서 StackNavigator 추가하기
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// MainScreen 추가
import TabNavigation from './TabNavigation';
import {FontAwesome} from "@expo/vector-icons";

const AppStack = createStackNavigator();

const LeftOnPress = () => {
  Alert.alert("alert title", "Left On Press");
}

const RightOnPress = () => {
  Alert.alert("alert title", "right On Press");
}

export default function MainNavigation() {
  return(
    <NavigationContainer>
      <AppStack.Navigator
        initialRouteName="Main"
      >
        <AppStack.Screen 
          name="Main" 
          component={TabNavigation}
          options={{
            headerTitle: () => (
              <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <Image
                  style={{width: 200, height: 40, resizeMode:'contain'}}
                  source={{uri: 'https://더쥬.com/web/upload/category/logo/00c4d87bfb16fa18181a100943d8d85f_uQL3jIDLCp_7_top.jpg'}}
                />
              </View>
            ),
            headerLeft: () => (
              <TouchableOpacity onPress={LeftOnPress}>
                <FontAwesome name='shopping-cart' size={30} style={{ paddingLeft:10}}/>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={RightOnPress}>
                <FontAwesome name='search' size={30} style={{ paddingRight:20 }}/>
              </TouchableOpacity>
            )
          }} />
        
      </AppStack.Navigator>
    </NavigationContainer>
  );
}