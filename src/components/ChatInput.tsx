import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Send } from "reicon-react-native";
import { useAppTheme } from "../constants/theme";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disclaimer?: string;
  speedLabel?: string;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  disclaimer = "AI can make mistakes",
  speedLabel = "700 wpm",
}: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const canSend = value.trim().length > 0;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
      pointerEvents="box-none"
    >
      {/* Bottom fade gradient behind the floating input bar */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="bottom-fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.background} stopOpacity="0" />
              <Stop offset="0.38" stopColor={theme.background} stopOpacity="1" />
              <Stop offset="1" stopColor={theme.background} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottom-fade)" />
        </Svg>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: theme.metaText }]}>{disclaimer}</Text>
        <Text style={[styles.metaText, { color: theme.metaText }]}>{speedLabel}</Text>
      </View>

      <View style={[styles.inputPill, { backgroundColor: theme.surface }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask a question..."
          placeholderTextColor={theme.placeholder}
          style={[styles.textInput, { color: theme.text }]}
          returnKeyType="send"
          onSubmitEditing={() => {
            if (canSend) onSend();
          }}
          blurOnSubmit={false}
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.sendButton,
            !canSend && styles.sendDisabled,
            pressed && canSend && styles.sendPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Send size={28} weight="Filled" color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 28,
    zIndex: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  metaText: {
    fontFamily: "AlloVariable",
    fontSize: 14,
    fontWeight: "400",
    opacity: 0.5,
  },
  inputPill: {
    borderRadius: 65,
    paddingLeft: 25,
    paddingRight: 20,
    paddingVertical: 14,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: "AlloVariable",
    fontSize: 20,
    fontWeight: "400",
    paddingVertical: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    opacity: 0.35,
  },
  sendPressed: {
    opacity: 0.65,
  },
});
