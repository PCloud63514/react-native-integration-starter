import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

function MainScreen() {
        return (
            <View style={style.container}>
                <Text>MainScreen11112211</Text>
            </View>
        );
    
}

export default MainScreen;

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})