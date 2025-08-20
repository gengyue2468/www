// components/ThemeAwareCodeHighlight.js
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeAwareCodeHighlight = () => {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // 根据主题动态加载对应的代码高亮样式
    const loadHighlightStyle = async () => {
      try {
        // 移除现有的高亮样式
        const existingStyles = document.querySelectorAll('link[data-highlight-style]');
        existingStyles.forEach(style => style.remove());

        // 动态导入对应的样式
        if (resolvedTheme === 'dark') {
          await import('highlight.js/styles/github-dark.css');
        } else {
          await import('highlight.js/styles/github.css');
        }

        // 标记样式链接以便后续移除
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

  return null; // 这个组件不渲染任何内容
};

export default ThemeAwareCodeHighlight;