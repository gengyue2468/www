'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeAwareCodeHighlight = () => {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadHighlightStyle = async () => {
      try {
        const existingStyles = document.querySelectorAll('link[data-highlight-style]');
        existingStyles.forEach(style => style.remove());
        if (resolvedTheme === 'dark') {
          await import('highlight.js/styles/github-dark.css');
        } else {
          await import('highlight.js/styles/github.css');
        }

        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
          if (link.href.includes('highlight.js')) {
            link.setAttribute('data-highlight-style', 'true');
          }
        });
      } catch (error) {
        console.error('Failed to load highlight.js style:', error);
      }
    };

    loadHighlightStyle();
  }, [resolvedTheme, isMounted]);

  return null;
};

export default ThemeAwareCodeHighlight;