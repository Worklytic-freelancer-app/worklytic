import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS } from '@/constant/color';

interface LoadingProps {
    containerStyle?: ViewStyle;
    size?: number;
}

export default function Loading({ containerStyle, size = 200 }: LoadingProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            <LottieView
                source={require('@/assets/loading.json')}
                autoPlay
                loop
                style={{ width: size, height: size }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
});