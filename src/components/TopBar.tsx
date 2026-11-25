import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { AngleDown, AngleUp, MoreH } from "reicon-react-native";
import { AppTheme, useAppTheme } from "../constants/theme";

interface TopBarProps {
  modelName?: string;
  onBackPress?: () => void;
  onModelPress?: () => void;
  onMorePress?: () => void;
}

const BUTTON_HEIGHT = 58;

function GradientSurface({
  width,
  height = BUTTON_HEIGHT,
  borderRadius = BUTTON_HEIGHT / 2,
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
        strokeWidth={2}
      />
    </Svg>
  );
}

export function TopBar({
  modelName = "Qwen 2.5 Coder",
  onBackPress,
  onModelPress,
  onMorePress,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [pillWidth, setPillWidth] = React.useState(210);

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
      {/* Top fade gradient behind the floating controls */}
      <View style={[styles.fadeContainer, { height: insets.top + 135 }]} pointerEvents="none">
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
      </View>

      <View style={styles.row} pointerEvents="box-none">
        <Pressable
          onPress={onBackPress}
          style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Scroll or go back"
        >
          <GradientSurface width={BUTTON_HEIGHT} idPrefix="left-btn" theme={theme} />
          <View style={styles.iconDim}>
            <AngleUp size={40} weight="Outline" color={theme.text} />
          </View>
        </Pressable>

        <Pressable
          onPress={onModelPress}
          onLayout={(e) => setPillWidth(e.nativeEvent.layout.width)}
          style={({ pressed }) => [styles.modelPill, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Select model: ${modelName}`}
        >
          <GradientSurface width={pillWidth} idPrefix="pill-btn" theme={theme} />
          <Text style={[styles.modelText, { color: theme.text }]} numberOfLines={1}>
            {modelName}
          </Text>
          <AngleDown size={30} weight="Outline" color={theme.text} />
        </Pressable>

        <Pressable
          onPress={onMorePress}
          style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <GradientSurface width={BUTTON_HEIGHT} idPrefix="right-btn" theme={theme} />
          <View style={styles.iconDim}>
            <MoreH size={30} weight="Filled" color={theme.text} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  fadeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    gap: 12,
  },
  circleButton: {
    width: BUTTON_HEIGHT,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  modelPill: {
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT / 2,
    paddingHorizontal: 18,
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
  iconDim: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.75,
  },
});
