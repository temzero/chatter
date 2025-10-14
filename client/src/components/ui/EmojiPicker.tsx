import { useEmojiCategories } from "@/hooks/useEmojiCategories";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface EmojiCategory {
  name: string;
  emojis: string[];
  id?: string;
  googleIcon?: string;
}

interface CustomEmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const CustomEmojiPicker = ({ onSelect }: CustomEmojiPickerProps) => {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        setIsOpen((pre) => !pre);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <motion.div title="Emoji" ref={pickerRef} whileTap={{ scale: 0.8 }}>
      <a
        onClick={() => setIsOpen(!isOpen)}
        className={` hover:opacity-90 rounded-full cursor-pointer flex items-center select-none ${
          isOpen ? "bg-[--border-color] opacity-100" : "opacity-50"
        }`}
        aria-label="Open emoji picker"
      >
        <i className="material-symbols-outlined">sentiment_satisfied</i>
      </a>

      {isOpen && (
        <div
          className="absolute right-4 bottom-12 mb-3 w-80 bg-[var(--sidebar-color)] rounded-lg shadow-lg border custom-border overflow-x-hidden"
          style={{ zIndex: 99 }}
        >
          <div className="h-80 overflow-y-auto overflow-x-hidden pt-0">
            {combinedCategories.map((category) => (
              <div key={category.name}>
                <h3
                  id={`category-${category.name
                    .toLowerCase()
                    .replace(/ /g, "-")}`}
                  className={`font-semibold bg-[var(--sidebar-color)] custom-border-b p-1 px-3`}
                >
                  {category.name}
                </h3>
                <div className="grid grid-cols-8 gap-2 p-2">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:scale-[2] transition-all duration-200"
                      aria-label={`Select ${emoji} emoji`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between p-2 custom-border-t">
            {emojiCategories.map((category) => (
              <button
                className={`${
                  currentCategory.toLowerCase() === category.name.toLowerCase()
                    ? "opacity-100"
                    : "opacity-50"
                }`}
                key={category.id}
                onClick={() => scrollToCategory(category.name)}
              >
                <i className="material-symbols-outlined">
                  {category.googleIcon}
                </i>
              </button>
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
                recentEmojis.length > 0 && scrollToCategory(t("emoji.recently"))
              }
            >
              <i className="material-symbols-outlined">note_stack</i>
            </button>
            <button className="opacity-50 hover:opacity-100">
              <i className="material-symbols-outlined">gif_box</i>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CustomEmojiPicker;
