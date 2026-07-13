import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsRow from '@/components/settings/SettingsRow';
import SettingsSection from '@/components/settings/SettingsSection';
import { useAppTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { KeyIcon } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SecuritySettingsScreen() {
  const { t } = useTranslation('settings');
  const { isDark } = useAppTheme();
  return <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FBFAF8' }}>
    <SettingsHeader title={t('passwordSecurity')} />
    <SettingsSection title={t('loginSecurity')}>
      <SettingsRow icon={<KeyIcon size={22} color={isDark ? '#FFF' : '#111'} />} title={t('resetPassword')} subtitle={t('resetPasswordSubtitle')} onPress={() => router.push('/settings/reset-password')} />
    </SettingsSection>
  </SafeAreaView>;
}
