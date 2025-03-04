import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShimmerProps {
    width: number | string;
    height: number | string;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
    duration?: number;
}

export default function Shimmer({ 
    width, 
    height, 
    borderRadius = 0, 
    style,
    duration = 2000 // Durasi yang lebih lama untuk efek yang lebih halus
}: ShimmerProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    // Konversi width ke number jika string untuk animasi
    const widthNum = typeof width === 'number' ? width : 300;

    useEffect(() => {
        // Animasi yang lebih halus dengan loop yang lebih baik
        const startAnimation = () => {
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: duration,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Kurva easing yang lebih halus
                useNativeDriver: false,
            }).start(() => {
                animatedValue.setValue(0); // Reset nilai
                startAnimation(); // Mulai lagi
            });
        };

        startAnimation();
        
        return () => {
            // Cleanup animasi saat komponen unmount
            animatedValue.stopAnimation();
        };
    }, [animatedValue, duration]);

    // Animasi translateX yang lebih halus
    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-widthNum, widthNum * 1.5] // Jarak yang lebih pendek untuk efek yang lebih halus
    });

    return (
        <View 
            style={[
                styles.container, 
                { width, height, borderRadius },
                style as any
            ]}
        >
            <Animated.View
                style={[
                    styles.shimmer,
                    { transform: [{ translateX }] }
                ]}
            >
                <LinearGradient
                    colors={[
                        'rgba(0,0,0,0.01)',
                        'rgba(0,0,0,0.05)',
                        'rgba(0,0,0,0.1)',
                        'rgba(0,0,0,0.05)',
                        'rgba(0,0,0,0.01)'
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
    },
    shimmer: {
        width: '60%', // Lebar gradient yang lebih besar untuk efek yang lebih halus
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        width: '100%',
        height: '100%',
    }
}); 