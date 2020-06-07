import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class MainScreen extends Component {
    render(){
        return (
            <View style={style.container}>
                <Text>MainScreen2222222222</Text>
            </View>
        );
    }
}
 
const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})