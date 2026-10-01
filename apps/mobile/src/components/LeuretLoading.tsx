import { useEffect, useState } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, withTiming } from "react-native-reanimated";

import { colors, radius, shadows } from "@/constants/theme";

type LeuretLoadingProps = {
  message?: string;
  fullScreen?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function LeuretLoading({
  message = "Cargando…",
  fullScreen = false,
  compact = false,
  style,
}: LeuretLoadingProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setPulse((value) => !value), 700);
    return () => clearInterval(timer);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: withTiming(pulse ? 0.55 : 1, { duration: 650 }),
    transform: [{ scale: withTiming(pulse ? 1.14 : 0.94, { duration: 650 }) }],
  }), [pulse]);

  return (
    <Animated.View entering={FadeIn.duration(260)} style={[styles.container, fullScreen && styles.fullScreen, compact && styles.compact, style]}>
      <View style={styles.pulseWrap}>
        <Animated.View style={[styles.pulseHalo, pulseStyle]} />
        <View style={styles.pulseCore} />
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 150,
    padding: 24,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  fullScreen: {
    flex: 1,
    borderRadius: 0,
    backgroundColor: colors.background,
    shadowOpacity: 0,
    elevation: 0,
  },
  compact: {
    minHeight: 100,
    padding: 16,
  },
  pulseWrap: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseHalo: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accentSoft,
  },
  pulseCore: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.accent,
    ...shadows.glow,
  },
  message: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
});
