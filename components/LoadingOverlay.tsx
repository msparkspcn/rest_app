import {ActivityIndicator, StyleSheet, View} from "react-native";
import React from "react";

export default function LoadingOverlay() {
    return (
        <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
