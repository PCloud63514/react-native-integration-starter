import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function HomeTabPresenter() {
    return (
        <View style={styles.container}>
            <Text>Home Tab</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    }
});

export default HomeTabPresenter;