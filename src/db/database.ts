import * as SQLite from "expo-sqlite";
import { ChatMessage } from "../components/ChatBubble";

export interface ChatSummary {
  id: string;
  title: string;
  modelName: string;
  updatedAt: number;
}

interface SeedChat {
  id: string;
  title: string;
  modelName: string;
  updatedAt: number;
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
}

const SEED_CHATS: SeedChat[] = [
  {
    id: "chat-1",
    title: "Rust Screenshots & WebGPU AI",
    modelName: "Qwen 2.5 Coder",
    updatedAt: 1732700400000,
    messages: [
      {
        role: "user",
        content: "how to take a screenshot using rust code",
      },
      {
        role: "assistant",
        content:
          "The easiest route is the `screenshots` crate (cross-platform), or `xcap` which is its actively maintained successor. Here's how to do it with `xcap`.\n\n**Notes**\n• The returned image is an `image::RgbaImage`, so you can crop, resize, or encode it with the `image` crate.\n• **Linux:** works on X11 out of the box. On Wayland, capture goes through the XDG desktop portal/PipeWire, so you may need extra system packages (such as `libpipewire` and `libgbm` dev headers) and a permission prompt will appear.\n• **macOS:** you need to grant Screen Recording permission to your terminal or app in System Settings.\n• **Windows:** works without extra setup.",
      },
      {
        role: "user",
        content:
          "What's an efficient way to run lightweight ai models in the web browser",
      },
      {
        role: "assistant",
        content:
          "The most efficient options today, roughly in order of preference:\n\n1. **WebGPU-based runtimes** (best performance)\n• **Transformers.js** (Hugging Face): easiest start, runs ONNX models with WebGPU or WASM fallback. Great for embeddings, classification, speech, small vision models.\n• **WebLLM** (MLC): runs quantized LLMs (Llama, Qwen, Gemma, Phi) fully in-browser with WebGPU. OpenAI-style API.\n• **ONNX Runtime Web**: more control; supports WebGPU, WebGL, and WASM backends.\n\n2. **WASM-only (works everywhere, slower)**\n• **llama.cpp / wllama** and **whisper.cpp** compiled to WebAssembly. Good for broad compatibility when WebGPU isn't available.",
      },
    ],
  },
  {
    id: "chat-2",
    title: "Expo SQLite Offline Architecture",
    modelName: "Qwen 2.5 Coder",
    updatedAt: 1732696800000,
    messages: [
      {
        role: "user",
        content: "Best way to structure local SQLite tables for a mobile chat app?",
      },
      {
        role: "assistant",
        content:
          "Keep metadata and message payloads separated into two tables so the home screen stays fast even with thousands of messages.\n\n• **chats table:** `id`, `title`, `model_name`, and `updated_at` indexed descending.\n• **messages table:** `id`, `chat_id`, `role`, `content`, and `created_at` with a composite index on `(chat_id, created_at)`.\n• Enable `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON` on startup for smooth concurrent reads and cascading deletes.",
      },
    ],
  },
  {
    id: "chat-3",
    title: "Reanimated Bottom-to-Top Transitions",
    modelName: "Llama 3.2 3B",
    updatedAt: 1732693200000,
    messages: [
      {
        role: "user",
        content: "How do I animate a floating bar smoothly between top and bottom?",
      },
      {
        role: "assistant",
        content:
          "Drive both the sheet and the floating bar from a single `useSharedValue` progress (`0` for home, `1` for open).\n\n• Use `interpolate(progress.value, [0, 1], [bottomY, topY])` inside `useAnimatedStyle`.\n• Avoid animating `top` or `bottom` layout properties directly — animate `transform: [{ translateY }]` so it runs on the UI thread at 60/120fps.\n• Use `withSpring` with `damping: 22` and `stiffness: 220` for a crisp, natural feel without excessive bounce.",
      },
    ],
  },
  {
    id: "chat-4",
    title: "Minimalist Light & Dark Tokens",
    modelName: "Gemma 2 2B",
    updatedAt: 1732689600000,
    messages: [
      {
        role: "user",
        content: "What contrast ratios should I aim for in a monochrome dark theme?",
      },
      {
        role: "assistant",
        content:
          "Pure `#FFFFFF` on `#000000` can cause halation on OLED displays. Softening both ends makes long reading sessions much easier on the eyes:\n\n• **Background:** `#0A0A0A` instead of pure black.\n• **Surface:** `#161616` for cards, pills, and search inputs.\n• **Primary text:** `#D7D7D7` gives ~13.4:1 contrast without harsh glare.\n• **Borders:** `#363636` with a subtle diagonal gradient adds depth without bright outlines.",
      },
    ],
  },
];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("aqua.db");
  }
  return dbPromise;
}

/**
 * Initializes the local SQLite database with separate tables for the chat list
 * (`chats`) and chat content (`messages`), and seeds 4 dummy chats on first run.
 */
export async function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getDb();
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          model_name TEXT NOT NULL DEFAULT 'Qwen 2.5 Coder',
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY NOT NULL,
          chat_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_messages_chat_created
          ON messages (chat_id, created_at ASC);
      `);

      const row = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM chats"
      );

      if ((row?.count ?? 0) === 0) {
        await db.withTransactionAsync(async () => {
          for (const chat of SEED_CHATS) {
            await db.runAsync(
              "INSERT INTO chats (id, title, model_name, updated_at) VALUES (?, ?, ?, ?)",
              chat.id,
              chat.title,
              chat.modelName,
              chat.updatedAt
            );

            for (let i = 0; i < chat.messages.length; i++) {
              const msg = chat.messages[i];
              await db.runAsync(
                "INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
                `${chat.id}-msg-${i + 1}`,
                chat.id,
                msg.role,
                msg.content,
                chat.updatedAt + i * 1000
              );
            }
          }
        });
      }
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }

  return initPromise;
}

/**
 * Fetches all chats ordered by most recently updated.
 */
export async function getChats(): Promise<ChatSummary[]> {
  await initDatabase();
  const db = await getDb();
  return db.getAllAsync<ChatSummary>(
    "SELECT id, title, model_name AS modelName, updated_at AS updatedAt FROM chats ORDER BY updated_at DESC"
  );
}

/**
 * Fetches all messages for a given chat ordered chronologically.
 */
export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  await initDatabase();
  const db = await getDb();
  return db.getAllAsync<ChatMessage>(
    "SELECT id, role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
    chatId
  );
}

/**
 * Creates a new empty chat in the local SQLite database.
 */
export async function createChat(
  title = "New Chat",
  modelName = "Qwen 2.5 Coder"
): Promise<ChatSummary> {
  await initDatabase();
  const db = await getDb();
  const now = Date.now();
  const id = `chat-${now}-${Math.random().toString(36).slice(2, 7)}`;

  await db.runAsync(
    "INSERT INTO chats (id, title, model_name, updated_at) VALUES (?, ?, ?, ?)",
    id,
    title,
    modelName,
    now
  );

  return { id, title, modelName, updatedAt: now };
}

/**
 * Appends a message to a chat and updates the chat's `updated_at` timestamp.
 */
export async function addMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  await initDatabase();
  const db = await getDb();
  const now = Date.now();
  const id = `${chatId}-${now}-${Math.random().toString(36).slice(2, 7)}`;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
      id,
      chatId,
      role,
      content,
      now
    );
    if (role === "user") {
      const autoTitle = content.trim().slice(0, 48);
      await db.runAsync(
        "UPDATE chats SET title = CASE WHEN title = 'New Chat' THEN ? ELSE title END, updated_at = ? WHERE id = ?",
        autoTitle,
        now,
        chatId
      );
    } else {
      await db.runAsync(
        "UPDATE chats SET updated_at = ? WHERE id = ?",
        now,
        chatId
      );
    }
  });

  return { id, role, content };
}
