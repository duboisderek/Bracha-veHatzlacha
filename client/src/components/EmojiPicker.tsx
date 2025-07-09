import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

const EMOJI_CATEGORIES = {
  smileys: {
    name: "Visages",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓"]
  },
  gestures: {
    name: "Gestes",
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "👁️", "👀", "🫀", "🫁", "🩸", "👶", "🧒", "👦", "👧", "🧑", "👱", "👨", "🧔", "👩", "🧓", "👴", "👵"]
  },
  objects: {
    name: "Objets",
    emojis: ["💰", "💎", "⚖️", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🧱", "⛓️", "🔫", "💣", "🧨", "🔪", "⚔️", "🛡️", "🚬", "⚰️", "⚱️", "🏺", "🔮", "📿", "💈", "⚗️", "🔭", "🔬", "🕳️", "💊", "💉", "🧬", "🦠", "🧫", "🧪", "🌡️", "🧹", "🧺", "🧻", "🚽", "🚰", "🚿", "🛁", "🛀", "🧴", "🧷", "🧸", "🧦", "🧤", "🧣", "👓", "🕶️", "🥽", "🥼", "👔", "👕", "👖", "🧥", "🧦"]
  }
};

export function EmojiPicker({ onEmojiSelect, trigger }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("smileys");

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
    setSearchTerm("");
  };

  const filteredEmojis = searchTerm 
    ? Object.values(EMOJI_CATEGORIES)
        .flatMap(category => category.emojis)
        .filter(emoji => emoji.includes(searchTerm))
    : EMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="p-2">
            <Smile className="w-4 h-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un emoji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {!searchTerm && (
          <div className="flex border-b">
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key as keyof typeof EMOJI_CATEGORIES)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeCategory === key
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <motion.button
                key={`${emoji}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
          
          {filteredEmojis.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Smile className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun emoji trouvé</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Hook for managing message reactions
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

  return { reactions, addReaction, removeReaction };
}