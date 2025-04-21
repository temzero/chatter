import { useState, useRef, useEffect } from 'react';
import { emojiCategories } from '@/data/emoji';

const CustomEmojiPicker = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState(() => {
    const saved = localStorage.getItem('recentEmojis');
    return saved ? JSON.parse(saved) : [];
  });

  const pickerRef = useRef(null);
  const categoryRefs = useRef({}); // To hold references to each category header
  const [currentCategory, setCurrentCategory] = useState(
    recentEmojis.length > 0 ? 'Recently' : emojiCategories[0]?.name || ''
  );

  const combinedCategories = [
    ...(recentEmojis.length > 0 ? [{ name: 'Recently', emojis: recentEmojis }] : []),
    ...emojiCategories
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emoji) => {
    onSelect(emoji);

    setRecentEmojis(prev => {
      const updated = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 16); // Max 16
      localStorage.setItem('recentEmojis', JSON.stringify(updated));
      return updated;
    });
  };

  function scrollToCategory(categoryName) {
    const categoryId = categoryName.toLowerCase().replace(/ /g, '-');
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ block: 'start' });
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id.startsWith('category-')) {
            const categoryName = entry.target.id.replace('category-', '').replace(/-/g, ' ');
            setCurrentCategory(categoryName);
            console.log('current category:', categoryName)
          }
        });
      },
      {
        root: pickerRef.current?.querySelector('.h-80'), // Observe within the scrollable div
        threshold: 0.5, // Consider visible if at least 50% is showing
      }
    );

    // Observe each category header
    combinedCategories.forEach((category) => {
      const categoryId = category.name.toLowerCase().replace(/ /g, '-');
      const target = document.getElementById(`category-${categoryId}`);
      if (target) {
        observer.observe(target);
      }
    });

    return () => {
      observer.disconnect(); // Clean up the observer
    };
  }, [combinedCategories]); // Re-run when categories change

  return (
    <div className="" ref={pickerRef}>
      <a
        onClick={() => setIsOpen(!isOpen)}
        className="opacity-50 hover:opacity-90 cursor-pointer rounded flex items-center select-none"
        aria-label="Open emoji picker"
      >
        <i className="material-symbols-outlined">sentiment_satisfied</i>
      </a>

      {isOpen && (
        <div className="absolute right-4 bottom-12 mb-3 w-80 bg-[var(--sidebar-color)] rounded-lg shadow-lg border custom-border z-50 overflow-x-hidden">
          <div className="h-80 overflow-y-auto overflow-x-hidden pt-0">
            {combinedCategories.map((category) => (
              <div key={category.name}>
                <h3
                  id={`category-${category.name.toLowerCase().replace(/ /g, '-')}`}
                  className={`text-sm font-semibold bg-[var(--sidebar-color)] custom-border-b top-0 p-2 pl-3 z-10 ${
                    currentCategory.toLowerCase() === category.name.toLowerCase() ? 'font-bold text-primary-color' : ''
                  }`}
                >
                  {category.name}
                </h3>
                <div className="grid grid-cols-8 gap-2 p-2">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:scale-150 transition-all duration-200"
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
                  currentCategory.toLowerCase() === category.name.toLowerCase() ? 'opacity-100' : 'opacity-50'
                }`}
                key={category.id}
                onClick={() => scrollToCategory(category.name)}
              >
                <i className="material-symbols-outlined">{category.googleIcon}</i>
              </button>
            ))}

            <div className="custom-border-l"></div>

            <button
              className={`opacity-50 hover:opacity-100 ${currentCategory.toLowerCase() === 'recently' ? 'opacity-100' : ''}`}
              onClick={() => recentEmojis.length > 0 && scrollToCategory('Recently')}
            >
              <i className="material-symbols-outlined">note_stack</i>
            </button>
            <button className="opacity-50 hover:opacity-100">
              <i className="material-symbols-outlined">gif_box</i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEmojiPicker;