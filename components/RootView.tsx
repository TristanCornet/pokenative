import { ViewProps, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated, {
    Easing,
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { interpolateColor } from 'react-native-reanimated/src';
import { useEffect } from 'react';

type Props = ViewProps & {
    backgrounColor?: string;
};

export function RootView({ style, backgrounColor, ...rest }: Props) {
    const colors = useThemeColors();
    const progress = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                progress.value,
                [0, 1],
                [colors.tint, backgrounColor ?? colors.tint],
            ),
        };
    }, [backgrounColor]);

    useEffect(() => {
        if (backgrounColor) {
            progress.value = 0;
            progress.value = withTiming(1, {
                duration: 700,
                easing: Easing.out(Easing.quad),
                reduceMotion: ReduceMotion.System,
            });
        }
    }, [backgrounColor]);

    if (!backgrounColor) {
        return (
            <SafeAreaView
                style={[rootStyles, { backgroundColor: colors.tint }, style]}
                {...rest}
            />
        );
    }

    return (
        <Animated.View style={[{ flex: 1 }, animatedStyle, style]}>
            <SafeAreaView style={rootStyles} {...rest}></SafeAreaView>
        </Animated.View>
    );
}

const rootStyles = {
    flex: 1,
    padding: 4,
} satisfies ViewStyle;
