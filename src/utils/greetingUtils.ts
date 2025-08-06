/**
 * Greeting utility functions for personalized dashboard header
 */

import { User } from "firebase/auth";

/**
 * Array of engaging subtitle messages that rotate daily
 */
const SUBTITLE_MESSAGES = [
  "Ready to tackle your assessments?",
  "Let's make today productive",
  "Time to stay on top of your studies", 
  "Your academic journey continues here",
  "Let's get started",
  "Ready to dive in?",
  "Here's what's ahead"
];

interface UserProfile {
  displayName?: string;
  avatarIconId?: string;
}

/**
 * Get time-based greeting based on current local time
 * @returns Greeting string based on time of day
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 0 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
};

/**
 * Get user's display name with fallback priority
 * Priority: profile.displayName → user.displayName → email username → "Student"
 * @param user Firebase user object
 * @param profile User profile from useUserProfile hook
 * @returns User's display name
 */
export const getUserDisplayName = (
  user: User | null, 
  profile: UserProfile | null
): string => {
  // First priority: profile displayName
  if (profile?.displayName?.trim()) {
    return profile.displayName.trim();
  }
  
  // Second priority: user displayName from auth
  if (user?.displayName?.trim()) {
    return user.displayName.trim();
  }
  
  // Third priority: extract username from email
  if (user?.email) {
    const emailUsername = user.email.split("@")[0];
    if (emailUsername?.trim()) {
      return emailUsername.trim();
    }
  }
  
  // Final fallback
  return "Student";
};

/**
 * Get complete personalized greeting message
 * @param user Firebase user object
 * @param profile User profile from useUserProfile hook
 * @returns Complete greeting message (e.g., "Good Morning, John!")
 */
export const getPersonalizedGreeting = (
  user: User | null, 
  profile: UserProfile | null
): string => {
  const timeGreeting = getTimeBasedGreeting();
  const userName = getUserDisplayName(user, profile);
  
  return `${timeGreeting}, ${userName}!`;
};

/**
 * Get rotating subtitle message that changes daily
 * Uses day of year to ensure consistent message throughout the day
 * but different message each day for variety
 * @returns Rotating subtitle message
 */
export const getRotatingSubtitle = (): string => {
  const today = new Date();
  // Calculate day of year (1-365/366)
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Use modulo to cycle through messages
  const index = (dayOfYear - 1) % SUBTITLE_MESSAGES.length;
  return SUBTITLE_MESSAGES[index];
};


/**
 * Get milliseconds until next greeting update
 * Used for scheduling the next greeting change
 * @returns Milliseconds until next update
 */
export const getMillisecondsToNextGreetingUpdate = (): number => {
  const now = new Date();
  const hour = now.getHours();
  
  let nextUpdateHour: number;
  
  if (hour < 12) {
    nextUpdateHour = 12; // Next is afternoon
  } else if (hour < 17) {
    nextUpdateHour = 17; // Next is evening
  } else {
    nextUpdateHour = 24; // Next is tomorrow morning (midnight)
  }
  
  const nextUpdate = new Date(now);
  nextUpdate.setHours(nextUpdateHour % 24, 0, 0, 0);
  
  // If we're setting it to midnight, move to next day
  if (nextUpdateHour === 24) {
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }
  
  return nextUpdate.getTime() - now.getTime();
};