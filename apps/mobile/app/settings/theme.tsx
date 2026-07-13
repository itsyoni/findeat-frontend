import Text from '@/components/common/AppText';
import SettingsHeader from '@/components/settings/SettingsHeader';
import { ThemePreference, useAppTheme } from '@/contexts/ThemeContext';
import { CheckIcon, DeviceMobileIcon, MoonIcon, SunIcon } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

export default function ThemeSettingsScreen() {
  const { t } = useTranslation('settings');
  const { isDark, preference, setPreference } = useAppTheme();
  const color = isDark ? '#FFF' : '#111';
  const options: { key: ThemePreference; label: string; icon: ReactNode }[] = [
    { key: 'system', label: t('systemTheme'), icon: <DeviceMobileIcon size={23} color={color} /> },
    { key: 'light', label: t('lightTheme'), icon: <SunIcon size={23} color={color} /> },
    { key: 'dark', label: t('darkTheme'), icon: <MoonIcon size={23} color={color} /> },
  ];

  return <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FBFAF8' }}>
    <SettingsHeader title={t('chooseTheme')} />
    <View className="pt-3">
      {options.map((option) => (
        <TouchableOpacity key={option.key} onPress={() => void setPreference(option.key)} className="flex-row items-center px-5 py-4">
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">{option.icon}</View>
          <Text className="flex-1 text-base text-black dark:text-white">{option.label}</Text>
          {preference === option.key ? <CheckIcon size={22} color="#3B82F6" weight="bold" /> : null}
        </TouchableOpacity>
      ))}
    </View>
  </SafeAreaView>;
}
