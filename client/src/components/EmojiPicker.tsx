import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onEmojiSelect, className = "" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const emojiCategories = {
    smileys: {
      name: "Smileys",
      emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"]
    },
    hearts: {
      name: "Cœurs",
      emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"]
    },
    hands: {
      name: "Mains",
      emojis: ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤲", "🤝", "🙏"]
    },
    party: {
      name: "Fête",
      emojis: ["🎉", "🎊", "🥳", "🎈", "🎁", "🎂", "🍰", "🎃", "🎄", "🎆", "🎇", "🧨", "✨", "🎀", "🎗️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎯"]
    },
    nature: {
      name: "Nature",
      emojis: ["🌟", "⭐", "🌠", "☀️", "🌈", "⚡", "❄️", "🔥", "💧", "🌙", "🌍", "🌎", "🌏", "🌳", "🌲", "🌴", "🌱", "🌿", "🍀", "🌸", "🌺", "🌻", "🌹", "🌷", "🌼"]
    },
    food: {
      name: "Nourriture",
      emojis: ["🍎", "🍏", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🌮", "🌯", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯"]
    }
  };

  const [activeCategory, setActiveCategory] = useState<keyof typeof emojiCategories>('smileys');

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2"
      >
        <Smile className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Emoji Picker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-full mb-2 right-0 z-50 bg-white border rounded-lg shadow-lg w-80"
            >
              {/* Category Tabs */}
              <div className="flex border-b">
                {Object.entries(emojiCategories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key as keyof typeof emojiCategories)}
                    className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                      activeCategory === key
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="p-3 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {emojiCategories[activeCategory].emojis.map((emoji, index) => (
                    <motion.button
                      key={`${activeCategory}-${index}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook pour les réactions de message
export function useMessageReactions() {
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});

  const addReaction = async (messageId: string, emoji: string, userId: string) => {
    try {
      const response = await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messageId, emoji, userId })
      });

      if (response.ok) {
        setReactions(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            [emoji]: (prev[messageId]?.[emoji] || 0) + 1
          }
        }));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, emoji: string, userId: string) => {
    try {
      const response = await fetch('/api/chat/reactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messageId, emoji, userId })
      });

      if (response.ok) {
        setReactions(prev => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            [emoji]: Math.max((prev[messageId]?.[emoji] || 0) - 1, 0)
          }
        }));
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  return {
    reactions,
    addReaction,
    removeReaction
  };
}