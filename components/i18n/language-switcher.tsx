"use client";

import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { getButtonStyles } from "@/components/nav/theme.config";
import { useThemeColor } from "@/components/nav/use-theme-color";
import { DropdownMenu } from "radix-ui";
import { menuStyles } from "../menu/menu.config";

const languages = [
  { code: "zh-CN", name: "简体中文" },
  { code: "zh-TW", name: "繁體中文" },
  { code: "en", name: "English" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentColor = null;
  const theme = useThemeColor(currentColor);
  const btnStyles = getButtonStyles(theme);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <>
      {languages.map((lang) => (
        <DropdownMenu.Item
          key={lang.name}
          asChild
          onClick={() => handleLanguageChange(lang.code)}
          className={classNames(
            menuStyles.item,
          )}
        >
          <span>{lang.name}</span>
        </DropdownMenu.Item>
      ))}
    </>
  );
}
