import Text from '@/components/common/AppText';
import SettingsHeader from '@/components/settings/SettingsHeader';
import { LANGUAGE_KEY } from '@/constants/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckIcon } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languages = [
  { code: 'en' as const, flag: '🇺🇸', label: 'English', nativeLabel: 'English' },
  { code: 'he' as const, flag: '🇮🇱', label: 'Hebrew', nativeLabel: 'עברית' },
];

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { isDark } = useAppTheme();
  const { refreshUser } = useAuth();
  const active = i18n.language.startsWith('he') ? 'he' : 'en';

  async function selectLanguage(language: 'en' | 'he') {
    if (language === active) return;
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await api.users.updateMe({ language: language === 'he' ? 'HE' : 'EN' });
    await refreshUser();
  }

  return <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FFF' }}>
    <SettingsHeader title={t('chooseLanguage')} />
    <View className="pt-3">
      {languages.map((language) => (
        <TouchableOpacity key={language.code} onPress={() => void selectLanguage(language.code)} className="flex-row items-center px-5 py-4">
          <Text className="mr-4 text-3xl">{language.flag}</Text>
          <View className="flex-1">
            <Text className="text-base text-black dark:text-white">{language.nativeLabel}</Text>
            {language.label !== language.nativeLabel ? <Text className="mt-0.5 text-sm text-gray-500">{language.label}</Text> : null}
          </View>
          {active === language.code ? <CheckIcon size={22} color="#3B82F6" weight="bold" /> : null}
        </TouchableOpacity>
      ))}
    </View>
  </SafeAreaView>;
}
