import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { LeuretButton } from "@/components/LeuretButton";
import { colors, radius } from "@/constants/theme";

type FeedbackTone = "success" | "error" | "warning" | "info";

type LeuretFeedbackProps = {
  title: string;
  message?: string;
  tone?: FeedbackTone;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function LeuretFeedback({
  title,
  message,
  tone = "info",
  actionLabel,
  onAction,
  compact = false,
  style,
}: LeuretFeedbackProps) {
  const config = tone === "success"
    ? { icon: "checkmark-circle-outline" as const, color: colors.success, background: colors.successSoft }
    : tone === "error"
      ? { icon: "alert-circle-outline" as const, color: colors.danger, background: colors.dangerSoft }
      : tone === "warning"
        ? { icon: "warning-outline" as const, color: colors.warning, background: colors.warningSoft }
        : { icon: "information-circle-outline" as const, color: colors.info, background: colors.infoSoft };

  return (
    <Animated.View entering={FadeInDown.duration(320)} style={[styles.container, compact && styles.compact, { backgroundColor: config.background, borderColor: config.color }, style]}>
      <View style={[styles.iconWrap, { borderColor: config.color }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {actionLabel && onAction ? <LeuretButton label={actionLabel} variant="ghost" onPress={onAction} style={styles.action} /> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  compact: {
    padding: 11,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  message: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  action: {
    alignSelf: "flex-start",
    minHeight: 40,
    marginTop: 10,
  },
});
