import { Ionicons } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors, radius } from "../constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type ModuleCardProps = {
  title: string;
  description: string;
  icon: IconName;
  onPress?: () => void;
};

export function ModuleCard({
  title,
  description,
  icon,
  onPress,
}: ModuleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={23} color={colors.primary} />
      </View>

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
    minHeight: 170,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    width: 45,
    height: 45,
    marginBottom: 15,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },

  description: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});