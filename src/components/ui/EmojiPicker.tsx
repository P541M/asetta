import { useState } from 'react';
import { EMOJI_CATEGORIES, getEmojisByCategory, searchEmojis, EmojiCategory, EmojiData } from '../../data/emojis';

interface EmojiPickerProps {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
  variant?: 'inline' | 'modal';
  className?: string;
}

const EmojiPicker = ({
  selectedEmoji,
  onEmojiSelect,
  variant = 'inline',
  className = ''
}: EmojiPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>('people');
  const [searchQuery, setSearchQuery] = useState('');

  const displayEmojis = searchQuery 
    ? searchEmojis(searchQuery)
    : getEmojisByCategory(selectedCategory);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  const EmojiGrid = ({ emojis }: { emojis: EmojiData[] }) => (
    <div className="grid grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
      {emojis.map((emojiData) => (
        <button
          key={emojiData.emoji}
          type="button"
          onClick={() => handleEmojiClick(emojiData.emoji)}
          className={`
            group relative w-10 h-10 rounded-lg border-2 transition-all duration-200 
            hover:shadow-md flex items-center justify-center
            text-xl bg-light-bg-primary dark:bg-dark-bg-primary
            ${selectedEmoji === emojiData.emoji
              ? 'border-light-button-primary dark:border-dark-button-primary shadow-lg'
              : 'border-light-border-primary dark:border-dark-border-primary hover:border-light-button-primary dark:hover:border-dark-button-primary'
            }
          `}
          title={emojiData.name}
          aria-label={`Select ${emojiData.name} emoji`}
        >
          <span className="select-none">{emojiData.emoji}</span>
          {selectedEmoji === emojiData.emoji && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );

  const CategoryTabs = () => (
    <div className="flex items-center gap-1 mb-4 overflow-x-auto">
      {EMOJI_CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => {
            setSelectedCategory(category.id);
            setSearchQuery('');
          }}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200 whitespace-nowrap
            ${selectedCategory === category.id && !searchQuery
              ? 'bg-light-button-primary dark:bg-dark-button-primary text-white'
              : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary'
            }
          `}
          aria-label={`${category.name} category`}
        >
          <span className="text-base">{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );

  const SearchBar = () => (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-4 w-4 text-light-text-tertiary dark:text-dark-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search emojis..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="
          w-full pl-10 pr-4 py-2 border border-light-border-primary dark:border-dark-border-primary 
          rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary 
          text-light-text-primary dark:text-dark-text-primary
          placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary
          focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary 
          focus:border-light-button-primary dark:focus:border-dark-button-primary 
          outline-none transition-all duration-200 text-sm
        "
      />
    </div>
  );

  const content = (
    <div className={`space-y-4 ${className}`}>
      <SearchBar />
      {!searchQuery && <CategoryTabs />}
      
      {searchQuery && (
        <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
          {displayEmojis.length} results for &ldquo;{searchQuery}&rdquo;
        </div>
      )}
      
      {displayEmojis.length > 0 ? (
        <EmojiGrid emojis={displayEmojis} />
      ) : (
        <div className="text-center py-8 text-light-text-tertiary dark:text-dark-text-tertiary">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">No emojis found</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl border border-light-border-primary dark:border-dark-border-primary p-4 shadow-lg max-w-sm w-full">
        {content}
      </div>
    );
  }

  return content;
};

export default EmojiPicker;