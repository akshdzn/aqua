import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Add, AngleDown, AngleUp, MoreH } from "reicon-react-native";
import { AppTheme, useAppTheme } from "../constants/theme";

interface TopBarProps {
  progress: SharedValue<number>;
  isChatOpen: boolean;
  showLeftButton: boolean;
  modelName?: string;
  onLeftPress?: () => void;
  onModelPress?: () => void;
  onMorePress?: () => void;
}

export const TOP_BAR_HEIGHT = 58;

function GradientSurface({
  width,
  height = TOP_BAR_HEIGHT,
  borderRadius = TOP_BAR_HEIGHT / 2,
  idPrefix,
  theme,
}: {
  width: number;
  height?: number;
  borderRadius?: number;
  idPrefix: string;
  theme: AppTheme;
}) {
  const cx = width / 2;
  const cy = height / 2;
  const halfSpan = (width + height) / 4;

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={`${idPrefix}-fill`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.buttonGradientTop} stopOpacity="1" />
          <Stop offset="1" stopColor={theme.buttonGradientBottom} stopOpacity="1" />
        </LinearGradient>
        <LinearGradient
          id={`${idPrefix}-stroke`}
          gradientUnits="userSpaceOnUse"
          x1={cx - halfSpan}
          y1={cy + halfSpan}
          x2={cx + halfSpan}
          y2={cy - halfSpan}
        >
          <Stop offset="0" stopColor={theme.buttonBorder} stopOpacity="0" />
          <Stop offset="0.5" stopColor={theme.buttonBorder} stopOpacity="1" />
          <Stop offset="1" stopColor={theme.buttonBorder} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect
        x={1}
        y={1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        rx={borderRadius}
        ry={borderRadius}
        fill={`url(#${idPrefix}-fill)`}
        stroke={`url(#${idPrefix}-stroke)`}
        strokeWidth={1}
      />
    </Svg>
  );
}

/**
 * Floating control bar that sits at the bottom on the home screen
 * and slides to the top when a chat is open.
 */
export function TopBar({
  progress,
  isChatOpen,
  showLeftButton,
  modelName = "Qwen 2.5 Coder",
  onLeftPress,
  onModelPress,
  onMorePress,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const theme = useAppTheme();
  const [pillWidth, setPillWidth] = React.useState(180);

  const topY = insets.top + 10;
  const bottomY = Math.max(topY, windowHeight - Math.max(0, insets.bottom - 32) - TOP_BAR_HEIGHT);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [bottomY, topY]),
      },
    ],
  }));

  const topFadeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  const pillLabel = isChatOpen ? modelName : "Model Manager";

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Top fade gradient behind the bar when positioned at the top in chat */}
      <Animated.View
        style={[
          styles.topFadeContainer,
          { height: insets.top + 135 },
          topFadeAnimatedStyle,
        ]}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="top-fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.background} stopOpacity="1" />
              <Stop offset="0.62" stopColor={theme.background} stopOpacity="1" />
              <Stop offset="1" stopColor={theme.background} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#top-fade)" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[styles.barRow, barAnimatedStyle]}
        pointerEvents="box-none"
      >
        {showLeftButton ? (
          <Pressable
            onPress={onLeftPress}
            style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={isChatOpen ? "Back to home" : "Resume last chat"}
          >
            <GradientSurface width={TOP_BAR_HEIGHT} idPrefix="left-btn" theme={theme} />
            <Animated.View style={[styles.iconDim, arrowAnimatedStyle]}>
              <AngleUp size={40} weight="Outline" color={theme.text} />
            </Animated.View>
          </Pressable>
        ) : (
          <View style={styles.leftSpacer} pointerEvents="none" />
        )}

        <Pressable
          onPress={onModelPress}
          onLayout={(e) => setPillWidth(e.nativeEvent.layout.width)}
          style={({ pressed }) => [styles.modelPill, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={isChatOpen ? `Select model: ${modelName}` : "Model Manager"}
        >
          <GradientSurface width={pillWidth} idPrefix="pill-btn" theme={theme} />
          <Text
            style={[
              styles.modelText,
              !isChatOpen && styles.homePillText,
              { color: theme.text },
            ]}
            numberOfLines={1}
          >
            {pillLabel}
          </Text>
          {isChatOpen && <AngleDown size={30} weight="Outline" color={theme.text} />}
        </Pressable>

        <Pressable
          onPress={onMorePress}
          style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={isChatOpen ? "More options" : "New chat"}
        >
          <GradientSurface width={TOP_BAR_HEIGHT} idPrefix="right-btn" theme={theme} />
          <View style={styles.iconDim}>
            {isChatOpen ? (
              <MoreH size={30} weight="Filled" color={theme.text} />
            ) : (
              <Add size={32} weight="Outline" color={theme.text} />
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
  },
  topFadeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  barRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    gap: 12,
  },
  circleButton: {
    width: TOP_BAR_HEIGHT,
    height: TOP_BAR_HEIGHT,
    borderRadius: TOP_BAR_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  leftSpacer: {
    width: TOP_BAR_HEIGHT,
    height: TOP_BAR_HEIGHT,
  },
  modelPill: {
    height: TOP_BAR_HEIGHT,
    borderRadius: TOP_BAR_HEIGHT / 2,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    flexShrink: 1,
  },
  modelText: {
    fontFamily: "AlloVariable",
    fontSize: 16,
    fontWeight: "500",
  },
  homePillText: {
    fontSize: 20,
  },
  iconDim: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.75,
  },
});
