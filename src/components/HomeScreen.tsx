import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { MoreH, Search } from "reicon-react-native";
import { useAppTheme } from "../constants/theme";
import { ChatSummary } from "../db/database";

interface HomeScreenProps {
  chats: ChatSummary[];
  onSelectChat: (chat: ChatSummary) => void;
}

/**
 * Home screen displaying the AQUA header, chat search input, and SQLite-backed chat list.
 */
export function HomeScreen({ chats, onSelectChat }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [query, setQuery] = useState("");

  const filteredChats = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return chats;
    return chats.filter((chat) => chat.title.toLowerCase().includes(trimmed));
  }, [chats, query]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.brandTitle, { color: theme.text }]}>AQUA</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
        <View style={styles.searchIcon}>
          <Search size={24} weight="Outline" color={theme.text} />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your chats"
          placeholderTextColor={theme.placeholder}
          style={[styles.searchInput, { color: theme.text }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 100 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.placeholder }]}>
            No chats found
          </Text>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onSelectChat(item)}
            style={({ pressed }) => [
              styles.chatRow,
              index === 0 ? styles.firstChatRow : styles.regularChatRow,
              { backgroundColor: theme.surface },
              pressed && styles.rowPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Open chat: ${item.title}`}
          >
            <Text
              style={[styles.chatTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View style={styles.moreIcon}>
              <MoreH size={30} weight="Filled" color={theme.text} />
            </View>
          </Pressable>
        )}
      />

      {/* Bottom fade gradient behind the floating bottom bar */}
      <View
        style={[
          styles.bottomFade,
          { height: Math.max(insets.bottom, 16) + 120 },
        ]}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="home-bottom-fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.background} stopOpacity="0" />
              <Stop offset="0.38" stopColor={theme.background} stopOpacity="1" />
              <Stop offset="1" stopColor={theme.background} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#home-bottom-fade)" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingBottom: 18,
  },
  brandTitle: {
    fontFamily: "AlloVariable",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  searchBar: {
    marginHorizontal: 22,
    height: 41,
    borderRadius: 57,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchIcon: {
    opacity: 0.8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "AlloVariable",
    fontSize: 18,
    fontWeight: "500",
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  separator: {
    height: 10,
  },
  chatRow: {
    height: 43,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  firstChatRow: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  regularChatRow: {
    borderRadius: 14,
  },
  chatTitle: {
    flex: 1,
    fontFamily: "AlloVariable",
    fontSize: 18,
    fontWeight: "400",
    opacity: 0.8,
  },
  moreIcon: {
    opacity: 0.5,
  },
  rowPressed: {
    opacity: 0.75,
  },
  emptyText: {
    fontFamily: "AlloVariable",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
