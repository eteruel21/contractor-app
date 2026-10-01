import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { LeuretButton } from "@/components/LeuretButton";
import { colors, radius, shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type LeuretEmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: IconName;
  onAction?: () => void;
  compact?: boolean;
  enteringDelay?: number;
  style?: StyleProp<ViewStyle>;
};

export function LeuretEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  compact = false,
  enteringDelay = 0,
  style,
}: LeuretEmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(enteringDelay).duration(360)}
      style={[styles.container, compact && styles.compact, style]}
    >
      <Animated.View style={styles.iconWrap}>
        <Ionicons name={icon} size={29} color={colors.accent} />
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction ? (
        <LeuretButton
          label={actionLabel}
          icon={actionIcon}
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    ...shadows.soft,
  },
  compact: {
    paddingVertical: 34,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 16,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    maxWidth: 320,
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  action: {
    marginTop: 20,
    minWidth: 170,
  },
});
