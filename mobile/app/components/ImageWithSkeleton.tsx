import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet, StyleProp, ViewStyle, TextStyle, ImageStyle, RegisteredStyle, RecursiveArray, Falsy } from 'react-native';
import Shimmer from './Shimmer';

interface ImageWithSkeletonProps extends ImageProps {
    skeletonStyle?: StyleProp<ViewStyle>;
}

// Definisi tipe yang lebih lengkap untuk style
type StyleType = ViewStyle | TextStyle | ImageStyle | Falsy | RegisteredStyle<ViewStyle | TextStyle | ImageStyle> | RecursiveArray<ViewStyle | TextStyle | ImageStyle | Falsy | RegisteredStyle<ViewStyle | TextStyle | ImageStyle>> | readonly (ViewStyle | TextStyle | ImageStyle | Falsy | RegisteredStyle<ViewStyle | TextStyle | ImageStyle>)[];

export default function ImageWithSkeleton({ 
    style, 
    source, 
    skeletonStyle, 
    ...props 
}: ImageWithSkeletonProps) {
    const [loading, setLoading] = useState(true);
    
    // Ekstrak dimensi dari style untuk Shimmer
    const getStyleValue = (style: any, property: string): number | string | undefined => {
        if (!style) return undefined;
        if (typeof style === 'number') {
            const flattenedStyle = StyleSheet.flatten(StyleSheet.create({ temp: { width: style, height: style } }).temp);
            return flattenedStyle[property as keyof typeof flattenedStyle];
        }
        if (Array.isArray(style)) {
            for (let i = style.length - 1; i >= 0; i--) {
                const value = getStyleValue(style[i], property);
                if (value !== undefined) return value;
            }
        } else if (typeof style === 'object' && style !== null) {
            const flattenedStyle = StyleSheet.flatten(style);
            const value = flattenedStyle[property as keyof typeof flattenedStyle];
            if (value !== null) {
                return value as number | string | undefined;
            }
        }
        return undefined;
    };

    const width = getStyleValue(style, 'width') || '100%';
    const height = getStyleValue(style, 'height') || '100%';
    const borderRadius = getStyleValue(style, 'borderRadius') || getStyleValue(skeletonStyle, 'borderRadius') || 0;

    return (
        <View style={[style, styles.container]}>
            {loading && (
                <Shimmer 
                    width={width} 
                    height={height} 
                    borderRadius={typeof borderRadius === 'number' ? borderRadius : 0}
                    style={skeletonStyle} 
                />
            )}
            <Image
                {...props}
                source={source}
                style={[style, loading ? styles.hiddenImage : {}]}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    hiddenImage: {
        opacity: 0,
    }
}); 