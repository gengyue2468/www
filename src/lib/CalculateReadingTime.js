const calculateReadingTime = (content) => {
  const chineseCharsPerMinute = 200;
  const englishWordsPerMinute = 200;

  if (!content) return 0;

  const chineseChars = content.match(
    /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g
  );
  const chineseCount = chineseChars ? chineseChars.length : 0;

  const englishContent = content.replace(
    /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g,
    " "
  );
  const englishWords = englishContent.match(/\b[\w']+\b/g);
  const englishCount = englishWords ? englishWords.length : 0;

  const chineseMinutes = chineseCount / chineseCharsPerMinute;
  const englishMinutes = englishCount / englishWordsPerMinute;

  return [
    Math.ceil(chineseMinutes + englishMinutes) || 1,
    englishCount + chineseCount,
  ];
};

export { calculateReadingTime };
