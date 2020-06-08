import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function CategoryTabPresenter() {
    return (
        <View style={styles.container}>
            <Text>Category Tab</Text>
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

export default CategoryTabPresenter;