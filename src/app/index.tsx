import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatBubble, ChatMessage } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { TopBar } from "../components/TopBar";
import { useAppTheme } from "../constants/theme";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "how to take a screenshot using rust code",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "The easiest route is the `screenshots` crate (cross-platform), or `xcap` which is its actively maintained successor. Here's how to do it with `xcap`.\n\n**Notes**\n• The returned image is an `image::RgbaImage`, so you can crop, resize, or encode it with the `image` crate.\n• **Linux:** works on X11 out of the box. On Wayland, capture goes through the XDG desktop portal/PipeWire, so you may need extra system packages (such as `libpipewire` and `libgbm` dev headers) and a permission prompt will appear.\n• **macOS:** you need to grant Screen Recording permission to your terminal or app in System Settings.\n• **Windows:** works without extra setup.",
  },
  {
    id: "3",
    role: "user",
    content:
      "What's an efficient way to run lightweight ai models in the web browser",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "The most efficient options today, roughly in order of preference:\n\n1. **WebGPU-based runtimes** (best performance)\n• **Transformers.js** (Hugging Face): easiest start, runs ONNX models with WebGPU or WASM fallback. Great for embeddings, classification, speech, small vision models.\n• **WebLLM** (MLC): runs quantized LLMs (Llama, Qwen, Gemma, Phi) fully in-browser with WebGPU. OpenAI-style API.\n• **ONNX Runtime Web**: more control; supports WebGPU, WebGL, and WASM backends.\n\n2. **WASM-only (works everywhere, slower)**\n• **llama.cpp / wllama** and **whisper.cpp** compiled to WebAssembly. Good for broad compatibility when WebGPU isn't available.",
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newMessage: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + 88,
            paddingBottom: insets.bottom + 140,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      <TopBar
        modelName="Qwen 2.5 Coder"
        onBackPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />

      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 22,
  },
  separator: {
    height: 20,
  },
});
