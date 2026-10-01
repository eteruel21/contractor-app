import { useState, type ReactNode } from "react";
import { Pressable, type PressableProps, type PressableStateCallbackType } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MotionPressableProps = PressableProps & {
  children: ReactNode;
  pressedScale?: number;
  entering?: any;
};

export function MotionPressable({ children, pressedScale = 0.97, style, onPressIn, onPressOut, ...props }: MotionPressableProps) {
  const [isPressed, setIsPressed] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isPressed ? pressedScale : 1, {
          damping: isPressed ? 18 : 16,
          stiffness: isPressed ? 260 : 220,
          mass: isPressed ? 0.65 : 0.7,
        }),
      },
    ],
  }), [isPressed, pressedScale]);
  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        setIsPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setIsPressed(false);
        onPressOut?.(event);
      }}
      style={(state: PressableStateCallbackType) => [
        typeof style === "function" ? style(state) : style,
        animatedStyle,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}
