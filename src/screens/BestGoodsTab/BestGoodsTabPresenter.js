import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function BestGoodsTabPresenter() {
    return (
        <View style={styles.container}>
            <Text>Best Tab</Text>
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

export default BestGoodsTabPresenter;