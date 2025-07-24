export interface EmojiData {
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
}

export const EMOJI_CATEGORIES = [
  { id: 'people', name: 'People', icon: '😊' },
  { id: 'animals', name: 'Animals', icon: '🐱' },
  { id: 'objects', name: 'Objects', icon: '⚽' },
  { id: 'activities', name: 'Activities', icon: '🎯' },
] as const;

export type EmojiCategory = typeof EMOJI_CATEGORIES[number]['id'];

export const CURATED_EMOJIS: EmojiData[] = [
  // People (25 emojis)
  { emoji: '😊', name: 'Smiling Face', category: 'people', keywords: ['happy', 'smile', 'joy'] },
  { emoji: '😎', name: 'Cool Face', category: 'people', keywords: ['cool', 'sunglasses', 'awesome'] },
  { emoji: '🤓', name: 'Nerd Face', category: 'people', keywords: ['smart', 'nerd', 'glasses', 'study'] },
  { emoji: '😴', name: 'Sleeping Face', category: 'people', keywords: ['tired', 'sleep', 'exhausted'] },
  { emoji: '🤔', name: 'Thinking Face', category: 'people', keywords: ['thinking', 'wondering', 'curious'] },
  { emoji: '😤', name: 'Huffing Face', category: 'people', keywords: ['angry', 'frustrated', 'mad'] },
  { emoji: '🥳', name: 'Party Face', category: 'people', keywords: ['party', 'celebration', 'fun'] },
  { emoji: '🤯', name: 'Exploding Head', category: 'people', keywords: ['mind blown', 'shocked', 'amazed'] },
  { emoji: '😅', name: 'Grinning Face with Sweat', category: 'people', keywords: ['nervous', 'awkward', 'relief'] },
  { emoji: '🥺', name: 'Pleading Face', category: 'people', keywords: ['cute', 'puppy eyes', 'please'] },
  { emoji: '😇', name: 'Smiling Face with Halo', category: 'people', keywords: ['angel', 'innocent', 'good'] },
  { emoji: '🤭', name: 'Face with Hand Over Mouth', category: 'people', keywords: ['giggle', 'shy', 'oops'] },
  { emoji: '😏', name: 'Smirking Face', category: 'people', keywords: ['smirk', 'sly', 'confident'] },
  { emoji: '🙃', name: 'Upside Down Face', category: 'people', keywords: ['silly', 'sarcastic', 'ironic'] },
  { emoji: '😃', name: 'Grinning Face with Big Eyes', category: 'people', keywords: ['excited', 'happy', 'cheerful'] },
  { emoji: '🤗', name: 'Hugging Face', category: 'people', keywords: ['hug', 'warm', 'friendly'] },
  { emoji: '😮', name: 'Face with Open Mouth', category: 'people', keywords: ['surprised', 'wow', 'amazed'] },
  { emoji: '🙄', name: 'Face with Rolling Eyes', category: 'people', keywords: ['eye roll', 'annoyed', 'whatever'] },
  { emoji: '😋', name: 'Face Savoring Food', category: 'people', keywords: ['yummy', 'delicious', 'tasty'] },
  { emoji: '🤩', name: 'Star Struck', category: 'people', keywords: ['star eyes', 'amazed', 'impressed'] },
  { emoji: '😌', name: 'Relieved Face', category: 'people', keywords: ['peaceful', 'calm', 'content'] },
  { emoji: '🥰', name: 'Smiling Face with Hearts', category: 'people', keywords: ['love', 'adoration', 'cute'] },
  { emoji: '😆', name: 'Grinning Squinting Face', category: 'people', keywords: ['laughing', 'hilarious', 'funny'] },
  { emoji: '🤨', name: 'Face with Raised Eyebrow', category: 'people', keywords: ['skeptical', 'suspicious', 'hmm'] },
  { emoji: '😪', name: 'Sleepy Face', category: 'people', keywords: ['sleepy', 'tired', 'drowsy'] },

  // Animals (12 emojis)
  { emoji: '🐱', name: 'Cat Face', category: 'animals', keywords: ['cat', 'kitty', 'pet'] },
  { emoji: '🐶', name: 'Dog Face', category: 'animals', keywords: ['dog', 'puppy', 'pet'] },
  { emoji: '🦊', name: 'Fox', category: 'animals', keywords: ['fox', 'clever', 'orange'] },
  { emoji: '🐸', name: 'Frog', category: 'animals', keywords: ['frog', 'green', 'amphibian'] },
  { emoji: '🐧', name: 'Penguin', category: 'animals', keywords: ['penguin', 'cold', 'antarctic'] },
  { emoji: '🦉', name: 'Owl', category: 'animals', keywords: ['owl', 'wise', 'night'] },
  { emoji: '🐨', name: 'Koala', category: 'animals', keywords: ['koala', 'cute', 'australia'] },
  { emoji: '🐯', name: 'Tiger Face', category: 'animals', keywords: ['tiger', 'fierce', 'stripes'] },
  { emoji: '🦁', name: 'Lion', category: 'animals', keywords: ['lion', 'brave', 'king'] },
  { emoji: '🐰', name: 'Rabbit Face', category: 'animals', keywords: ['rabbit', 'bunny', 'cute'] },
  { emoji: '🦄', name: 'Unicorn', category: 'animals', keywords: ['unicorn', 'magical', 'rainbow'] },
  { emoji: '🐙', name: 'Octopus', category: 'animals', keywords: ['octopus', 'tentacles', 'ocean'] },

  // Objects (8 emojis)
  { emoji: '⚽', name: 'Soccer Ball', category: 'objects', keywords: ['soccer', 'football', 'sports'] },
  { emoji: '🎸', name: 'Guitar', category: 'objects', keywords: ['guitar', 'music', 'rock'] },
  { emoji: '📚', name: 'Books', category: 'objects', keywords: ['books', 'study', 'learning'] },
  { emoji: '🎯', name: 'Bullseye', category: 'objects', keywords: ['target', 'goal', 'accurate'] },
  { emoji: '🎨', name: 'Artist Palette', category: 'objects', keywords: ['art', 'creative', 'painting'] },
  { emoji: '⚡', name: 'Lightning Bolt', category: 'objects', keywords: ['lightning', 'energy', 'power'] },
  { emoji: '🔥', name: 'Fire', category: 'objects', keywords: ['fire', 'hot', 'awesome'] },
  { emoji: '⭐', name: 'Star', category: 'objects', keywords: ['star', 'favorite', 'special'] },

  // Activities (5 emojis)
  { emoji: '🏆', name: 'Trophy', category: 'activities', keywords: ['trophy', 'winner', 'achievement'] },
  { emoji: '🎮', name: 'Video Game', category: 'activities', keywords: ['gaming', 'video games', 'fun'] },
  { emoji: '🎵', name: 'Musical Note', category: 'activities', keywords: ['music', 'note', 'song'] },
  { emoji: '🚀', name: 'Rocket', category: 'activities', keywords: ['rocket', 'space', 'launch'] },
  { emoji: '🌟', name: 'Glowing Star', category: 'activities', keywords: ['shining', 'bright', 'excellent'] },
];

// Default emoji for new users
export const DEFAULT_EMOJI = '😊';

// Helper functions
export const getEmojisByCategory = (category: EmojiCategory): EmojiData[] => {
  return CURATED_EMOJIS.filter(emoji => emoji.category === category);
};

export const searchEmojis = (query: string): EmojiData[] => {
  if (!query.trim()) return CURATED_EMOJIS;
  
  const lowerQuery = query.toLowerCase();
  return CURATED_EMOJIS.filter(emoji => 
    emoji.name.toLowerCase().includes(lowerQuery) ||
    emoji.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
};

export const isValidEmoji = (emoji: string): boolean => {
  return CURATED_EMOJIS.some(emojiData => emojiData.emoji === emoji);
};