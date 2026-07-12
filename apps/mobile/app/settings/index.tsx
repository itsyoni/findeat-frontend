import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsRow from '@/components/settings/SettingsRow';
import SettingsSection from '@/components/settings/SettingsSection';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { BellIcon, LockKeyIcon, MoonIcon, SignOutIcon, UserCircleIcon } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { t } = useTranslation(['settings', 'common', 'profile']);
  const { isDark } = useAppTheme();
  const { logout } = useAuth();
  const color = isDark ? '#FFF' : '#111';

  function confirmLogout() {
    Alert.alert(t('common:logout'), t('profile:logoutConfirmation'), [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('common:logout'), style: 'destructive', onPress: () => void logout() },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FFF' }}>
      <SettingsHeader title={t('settings:title')} />
      <ScrollView>
        <SettingsSection title={t('settings:yourAccount')}>
          <SettingsRow icon={<UserCircleIcon size={23} color={color} />} title={t('settings:account')} subtitle={t('settings:accountSubtitle')} onPress={() => router.push('/settings/account')} />
          <SettingsRow icon={<LockKeyIcon size={23} color={color} />} title={t('settings:passwordSecurity')} subtitle={t('settings:passwordSecuritySubtitle')} onPress={() => router.push('/settings/security')} />
        </SettingsSection>
        <SettingsSection title={t('settings:howYouUseFindEat')}>
          <SettingsRow icon={<BellIcon size={23} color={color} />} title={t('settings:notifications')} subtitle={t('settings:notificationsSubtitle')} onPress={() => router.push('/settings/notifications')} />
          <SettingsRow icon={<MoonIcon size={23} color={color} />} title={t('settings:appearanceLanguage')} subtitle={t('settings:appearanceLanguageSubtitle')} onPress={() => router.push('/settings/appearance')} />
        </SettingsSection>
        <SettingsSection title={t('settings:login')}>
          <SettingsRow destructive icon={<SignOutIcon size={23} color="#EF4444" />} title={t('common:logout')} onPress={confirmLogout} />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
