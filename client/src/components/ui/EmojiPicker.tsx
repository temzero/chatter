import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEmojiCategories } from "@/common/hooks/useEmojiCategories";
import { useClickOutside } from "@/common/hooks/keyEvent/useClickOutside";
import { useTranslation } from "react-i18next";
import { useKeyDown } from "@/common/hooks/keyEvent/useKeydown";

interface EmojiCategory {
  name: string;
  emojis: string[];
  id?: string;
  googleIcon?: string;
}

interface CustomEmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onSelect }: CustomEmojiPickerProps) => {
  const { t } = useTranslation();
  const emojiCategories = useEmojiCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentEmojis");
    return saved ? JSON.parse(saved) : [];
  });

  const pickerRef = useRef<HTMLDivElement>(null);
  const [currentCategory, setCurrentCategory] = useState(
    recentEmojis.length > 0
      ? t("emoji.recently")
      : emojiCategories[0]?.name || ""
  );

  const combinedCategories: EmojiCategory[] = useMemo(
    () => [
      ...(recentEmojis.length > 0
        ? [{ name: t("emoji.recently"), emojis: recentEmojis }]
        : []),
      ...emojiCategories.map((cat) => ({
        ...cat,
        id: cat.id?.toString(), // Ensure id is string
      })),
    ],
    [emojiCategories, recentEmojis, t]
  );

  useClickOutside(pickerRef, () => setIsOpen(false));

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);

    setRecentEmojis((prev) => {
      const updated = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 16); // Max 16
      localStorage.setItem("recentEmojis", JSON.stringify(updated));
      return updated;
    });
  };

  function scrollToCategory(categoryName: string) {
    const categoryId = categoryName.toLowerCase().replace(/ /g, "-");
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ block: "start" });
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id.startsWith("category-")) {
            const categoryName = entry.target.id
              .replace("category-", "")
              .replace(/-/g, " ");
            setCurrentCategory(categoryName);
          }
        });
      },
      {
        root: pickerRef.current?.querySelector(".h-80"), // Observe within the scrollable div
        threshold: 0.5, // Consider visible if at least 50% is showing
      }
    );

    // Observe each category header
    combinedCategories.forEach((category) => {
      const categoryId = category.name.toLowerCase().replace(/ /g, "-");
      const target = document.getElementById(`category-${categoryId}`);
      if (target) {
        observer.observe(target);
      }
    });

    return () => {
      observer.disconnect(); // Clean up the observer
    };
  }, [combinedCategories]);

  useKeyDown(
    () => setIsOpen((prev) => !prev),
    ["e"],
    { ctrl: true } // Only trigger on Ctrl + E
  );

  return (
    <div title="Emoji" ref={pickerRef}>
      <motion.a
        whileTap={{ scale: 0.88 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`hover:opacity-90 rounded-full! cursor-pointer flex items-center select-none focus:outline-none -mr-0.5 ${
          isOpen
            ? "bg-(--border-color) text-(--primary-green-glow) opacity-100"
            : "opacity-50"
        }`}
        aria-label="Open emoji picker"
      >
        <i className={`material-symbols-outlined ${isOpen && "filled"}`}>
          sentiment_satisfied
        </i>
      </motion.a>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="absolute right-4 bottom-12 mb-3 w-80 rounded-lg custom-border overflow-x-hidden bg-(--panel-color)!"
            style={{ zIndex: 99 }}
          >
            <div className="h-80 overflow-y-auto overflow-x-hidden pt-0">
              {combinedCategories.map((category) => (
                <div key={category.name}>
                  <h3
                    id={`category-${category.name
                      .toLowerCase()
                      .replace(/ /g, "-")}`}
                    className={`font-semibold custom-border-b p-1 px-3`}
                  >
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-8 gap-2 p-2">
                    {category.emojis.map((emoji) => (
                      <motion.button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        aria-label={`Select ${emoji} emoji`}
                        whileHover={{ scale: 1.6 }}
                        whileTap={{ scale: 1.3, rotate: 10 }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between p-2 custom-border-t">
              {emojiCategories.map((category) => (
                <motion.button
                  className={`${
                    currentCategory.toLowerCase() ===
                    category.name.toLowerCase()
                      ? "opacity-100"
                      : "opacity-40"
                  }`}
                  key={category.id}
                  onClick={() => scrollToCategory(category.name)}
                  whileTap={{ scale: 0.75 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <i
                    className={`material-symbols-outlined ${
                      currentCategory.toLowerCase() ===
                        category.name.toLowerCase() && "filled"
                    }`}
                  >
                    {category.googleIcon}
                  </i>
                </motion.button>
              ))}

              <div className="custom-border-l"></div>

              <button
                className={`opacity-50 hover:opacity-100 ${
                  currentCategory.toLowerCase() ===
                  t("emoji.recently").toLowerCase()
                    ? "opacity-100"
                    : ""
                }`}
                onClick={() =>
                  recentEmojis.length > 0 &&
                  scrollToCategory(t("emoji.recently"))
                }
              >
                <i className="material-symbols-outlined">note_stack</i>
              </button>
              <button className="opacity-50 hover:opacity-100">
                <i className="material-symbols-outlined">gif_box</i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmojiPicker;
