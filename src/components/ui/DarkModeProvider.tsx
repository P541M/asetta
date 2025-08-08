'use client';

import { useEffect } from 'react';

export default function DarkModeProvider() {
  useEffect(() => {
    // Check for saved dark mode preference
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return null;
}