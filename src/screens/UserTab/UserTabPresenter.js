import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function UserTabPresenter() {
    return (
        <View style={styles.container}>
            <Text>User Tab</Text>
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

export default UserTabPresenter;