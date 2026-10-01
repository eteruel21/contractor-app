import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { MotionPressable } from "@/components/MotionPressable";
import { colors, radius, shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type LeuretButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type LeuretButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  icon?: IconName;
  variant?: LeuretButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function LeuretButton({
  label,
  icon,
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: LeuretButtonProps) {
  const isDisabled = disabled || loading;
  const buttonVariantStyle = variant === "primary" ? styles.primaryButton : variant === "secondary" ? styles.secondaryButton : variant === "danger" ? styles.dangerButton : styles.ghostButton;
  const textVariantStyle = variant === "primary" || variant === "danger" ? styles.lightText : variant === "secondary" ? styles.secondaryText : styles.ghostText;
  const iconColor = variant === "primary" || variant === "danger" ? colors.textLight : variant === "secondary" ? colors.primary : colors.accent;

  return (
    <MotionPressable
      {...props}
      disabled={isDisabled}
      pressedScale={0.97}
      style={[styles.button, buttonVariantStyle, fullWidth && styles.fullWidth, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={19} color={iconColor} /> : null}
          <Text style={[styles.label, textVariantStyle]}>{label}</Text>
        </>
      )}
    </MotionPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullWidth: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: colors.accent,
    ...shadows.glow,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.soft,
  },
  ghostButton: {
    backgroundColor: colors.accentSoft,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
  },
  lightText: {
    color: colors.textLight,
  },
  secondaryText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.accent,
  },
  disabled: {
    opacity: 0.55,
  },
});
