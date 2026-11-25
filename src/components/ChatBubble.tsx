import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../constants/theme";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

/**
 * Renders inline **bold** and `code` segments inside a text block.
 */
function FormattedText({ text, color }: { text: string; color: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <Text style={[styles.assistantText, { color }]}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={styles.boldText}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <Text key={index} style={styles.codeText}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const theme = useAppTheme();

  if (message.role === "user") {
    return (
      <View style={[styles.userBubble, { backgroundColor: theme.surface }]}>
        <Text style={[styles.userText, { color: theme.text }]}>{message.content}</Text>
      </View>
    );
  }

  const paragraphs = message.content.split("\n\n");

  return (
    <View style={styles.assistantContainer}>
      {paragraphs.map((paragraph, index) => (
        <FormattedText key={index} text={paragraph} color={theme.text} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  userBubble: {
    alignSelf: "flex-end",
    borderRadius: 22,
    padding: 16,
    maxWidth: "85%",
  },
  userText: {
    fontFamily: "AlloVariable",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
  },
  assistantContainer: {
    alignSelf: "stretch",
    gap: 16,
  },
  assistantText: {
    fontFamily: "AlloVariable",
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "400",
  },
  boldText: {
    fontFamily: "AlloVariable",
    fontWeight: "700",
  },
  codeText: {
    fontFamily: MONO_FONT,
    fontSize: 15,
  },
});
