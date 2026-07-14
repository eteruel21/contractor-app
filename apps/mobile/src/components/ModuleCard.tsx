import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  colors,
  radius,
  shadows,
} from "../constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type ModuleCardProps = {
  title: string;
  description: string;
  icon: IconName;
  tone?: "green" | "blue" | "amber" | "violet";
  label?: string;
  onPress?: () => void;
};

const tones = {
  green: {
    icon: colors.primary,
    background: colors.primarySoft,
  },
  blue: {
    icon: colors.info,
    background: colors.infoSoft,
  },
  amber: {
    icon: colors.warning,
    background: colors.warningSoft,
  },
  violet: {
    icon: colors.violet,
    background: colors.violetSoft,
  },
};

export function ModuleCard({
  title,
  description,
  icon,
  tone = "green",
  label,
  onPress,
}: ModuleCardProps) {
  const selectedTone = tones[tone];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: selectedTone.background },
          ]}
        >
          <Ionicons
            name={icon}
            size={23}
            color={selectedTone.icon}
          />
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons
            name="arrow-up-outline"
            size={17}
            color={colors.textMuted}
            style={styles.arrow}
          />
        </View>
      </View>

      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minWidth: 150,
    maxWidth: 330,
    flexGrow: 1,
    minHeight: 184,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },

  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTop: {
    marginBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    transform: [{ rotate: "45deg" }],
  },

  label: {
    marginBottom: 5,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  description: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
