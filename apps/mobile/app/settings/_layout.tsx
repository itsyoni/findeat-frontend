import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function SettingsLayout() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('he');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          direction: isRtl ? 'rtl' : 'ltr',
        },
      }}
    />
  );
}
