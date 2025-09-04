import React from 'react'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguageStore } from '@/store'

/**
 * 语言切换器组件
 */
export function LanguageSwitcher({ variant = "button" }) {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguageStore()

  const languages = [
    { code: 'zh', name: t('language.chinese'), nativeName: '中文' },
    { code: 'en', name: t('language.english'), nativeName: 'English' },
  ]

  if (variant === "select") {
    return (
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const handleToggleLanguage = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh'
    setLanguage(newLanguage)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleLanguage}
      className="h-8 w-8"
      title={t('language.switch')}
    >
      <Globe className="h-3.5 w-3.5" />
    </Button>
  )
}
