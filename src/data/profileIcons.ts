import { IconType } from 'react-icons';
import { 
  // Essential icons from Heroicons
  HiUser, HiBookOpen, HiBriefcase, HiDesktopComputer, HiGlobe, 
  HiHeart, HiLightningBolt, HiMusicNote, HiSparkles, HiStar, HiSun,
} from 'react-icons/hi';
import { 
  // Essential icons from Feather
  FiCamera, FiCoffee, FiTarget,
} from 'react-icons/fi';
import { 
  // Essential icons from React Icons
  RiRocketLine,
} from 'react-icons/ri';

export interface IconData {
  icon: IconType;
  name: string;
  keywords: string[];
  id: string; // unique identifier for storage
}

export const CURATED_ICONS: IconData[] = [
  // 15 essential, universally recognizable profile icons
  { id: 'user', icon: HiUser, name: 'User', keywords: ['person', 'profile', 'account', 'default'] },
  { id: 'heart', icon: HiHeart, name: 'Heart', keywords: ['love', 'passion', 'emotion', 'care'] },
  { id: 'star', icon: HiStar, name: 'Star', keywords: ['favorite', 'special', 'achievement', 'excellent'] },
  { id: 'briefcase', icon: HiBriefcase, name: 'Briefcase', keywords: ['work', 'business', 'career', 'professional'] },
  { id: 'book', icon: HiBookOpen, name: 'Book', keywords: ['book', 'reading', 'study', 'student', 'academic'] },
  { id: 'computer', icon: HiDesktopComputer, name: 'Computer', keywords: ['computer', 'tech', 'development', 'developer'] },
  { id: 'globe', icon: HiGlobe, name: 'Globe', keywords: ['world', 'international', 'travel', 'global'] },
  { id: 'camera', icon: FiCamera, name: 'Camera', keywords: ['photography', 'visual', 'art', 'creative'] },
  { id: 'music', icon: HiMusicNote, name: 'Music', keywords: ['music', 'audio', 'sound', 'musician'] },
  { id: 'coffee', icon: FiCoffee, name: 'Coffee', keywords: ['coffee', 'energy', 'morning', 'caffeine'] },
  { id: 'sun', icon: HiSun, name: 'Sun', keywords: ['bright', 'positive', 'energy', 'sunny'] },
  { id: 'sparkles', icon: HiSparkles, name: 'Sparkles', keywords: ['magic', 'creative', 'inspiration', 'special'] },
  { id: 'target', icon: FiTarget, name: 'Target', keywords: ['goal', 'focus', 'achievement', 'aim'] },
  { id: 'rocket', icon: RiRocketLine, name: 'Rocket', keywords: ['launch', 'progress', 'ambition', 'growth'] },
  { id: 'lightning', icon: HiLightningBolt, name: 'Lightning', keywords: ['energy', 'power', 'dynamic', 'fast'] },
];

// Default icon for new users
export const DEFAULT_ICON_ID = 'user';
export const DEFAULT_ICON = CURATED_ICONS.find(icon => icon.id === DEFAULT_ICON_ID)!;

// Helper functions

export const getIconById = (id: string): IconData | undefined => {
  return CURATED_ICONS.find(icon => icon.id === id);
};

export const isValidIconId = (id: string): boolean => {
  return CURATED_ICONS.some(icon => icon.id === id);
};