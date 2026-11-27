import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatBubble, ChatMessage } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { HomeScreen } from "../components/HomeScreen";
import { TopBar } from "../components/TopBar";
import { useAppTheme } from "../constants/theme";
import {
  addMessage,
  ChatSummary,
  createChat,
  getChats,
  getMessages,
} from "../db/database";

const TRANSITION_CONFIG = {
  duration: 320,
  easing: Easing.out(Easing.cubic),
};

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const theme = useAppTheme();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [lastChat, setLastChat] = useState<ChatSummary | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");

  // 0 = Home screen, 1 = Chat screen
  const progress = useSharedValue(0);

  useEffect(() => {
    let active = true;
    getChats().then((rows) => {
      if (active) setChats(rows);
    });
    return () => {
      active = false;
    };
  }, []);

  const openChat = useCallback(
    async (chat: ChatSummary) => {
      Keyboard.dismiss();
      setLastChat(chat);
      setIsChatOpen(true);
      progress.set(withTiming(1, TRANSITION_CONFIG));

      const chatMessages = await getMessages(chat.id);
      setMessages(chatMessages);
    },
    [progress]
  );

  const closeChat = useCallback(() => {
    Keyboard.dismiss();
    setIsChatOpen(false);
    progress.set(withTiming(0, TRANSITION_CONFIG));
  }, [progress]);

  useEffect(() => {
    if (!isChatOpen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeChat();
      return true;
    });
    return () => sub.remove();
  }, [isChatOpen, closeChat]);

  const handleLeftPress = useCallback(() => {
    if (isChatOpen) {
      closeChat();
    } else if (lastChat) {
      openChat(lastChat);
    }
  }, [isChatOpen, lastChat, closeChat, openChat]);

  const handleNewChat = useCallback(async () => {
    const newChat = await createChat();
    const updatedChats = await getChats();
    setChats(updatedChats);
    await openChat(newChat);
  }, [openChat]);

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !lastChat) return;

    setInputText("");
    const saved = await addMessage(lastChat.id, "user", trimmed);
    setMessages((prev) => [...prev, saved]);
    const updatedChats = await getChats();
    setChats(updatedChats);

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [inputText, lastChat]);

  const hiddenOffset = windowHeight + insets.top + insets.bottom + 100;

  const chatSheetAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.02, 1], [0, 1, 1]),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [hiddenOffset, 0]),
      },
    ],
  }));

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <HomeScreen chats={chats} onSelectChat={openChat} />

      <Animated.View
        style={[
          styles.chatOverlay,
          { backgroundColor: theme.background },
          chatSheetAnimatedStyle,
        ]}
        pointerEvents={isChatOpen ? "auto" : "none"}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
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

          <ChatInput
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
          />
        </KeyboardAvoidingView>
      </Animated.View>

      <TopBar
        progress={progress}
        isChatOpen={isChatOpen}
        showLeftButton={isChatOpen || lastChat !== null}
        modelName={lastChat?.modelName ?? "Qwen 2.5 Coder"}
        onLeftPress={handleLeftPress}
        onMorePress={isChatOpen ? undefined : handleNewChat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  chatOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
  keyboardContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 22,
  },
  separator: {
    height: 20,
  },
});
