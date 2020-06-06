import React from "react";
import {StyleSheet, Text, View, Image} from "react-native";

export default function Loading() {
    return (
        <View style={styles.container}>
            <Image
                style={{height:'100%', width:'100%', resizeMode:'contain'}}
                source={{uri:'https://더쥬.com/web/upload/category/logo/00c4d87bfb16fa18181a100943d8d85f_uQL3jIDLCp_7_top.jpg'}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        padding: 30
    }
});