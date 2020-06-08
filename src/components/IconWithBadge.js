import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {FontAwesome} from "@expo/vector-icons";

export default function IconWithBadge({iconName}) {
    return (
        <View style={styles.container}>
            <FontAwesome name={iconName} size={30}/>
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