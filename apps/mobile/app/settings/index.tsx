import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsRow from '@/components/settings/SettingsRow';
import SettingsSection from '@/components/settings/SettingsSection';
import Text from '@/components/common/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { BellIcon, DeviceMobileIcon, FileTextIcon, HeadsetIcon, LockKeyIcon, MoonIcon, ShieldCheckIcon, SignOutIcon, SparkleIcon } from 'phosphor-react-native';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FBFAF8' }}>
      <SettingsHeader title={t('settings:title')} />
      <ScrollView>
        <SettingsSection title={t('settings:yourAccount')}>
          <SettingsRow icon={<LockKeyIcon size={23} color={color} />} title={t('settings:passwordSecurity')} subtitle={t('settings:passwordSecuritySubtitle')} onPress={() => router.push('/settings/security')} />
        </SettingsSection>
        <SettingsSection title={t('settings:howYouUseFindEat')}>
          <SettingsRow icon={<BellIcon size={23} color={color} />} title={t('settings:notifications')} subtitle={t('settings:notificationsSubtitle')} onPress={() => router.push('/settings/notifications')} />
          <SettingsRow icon={<DeviceMobileIcon size={23} color={color} />} title={t('settings:appPermissions')} subtitle={t('settings:appPermissionsSubtitle')} onPress={() => router.push('/settings/permissions')} />
          <SettingsRow icon={<ShieldCheckIcon size={23} color={color} />} title={t('settings:privacy')} subtitle={t('settings:privacySubtitle')} onPress={() => router.push('/settings/privacy')} />
          <SettingsRow icon={<MoonIcon size={23} color={color} />} title={t('settings:appearanceLanguage')} subtitle={t('settings:appearanceLanguageSubtitle')} onPress={() => router.push('/settings/appearance')} />
        </SettingsSection>
        <SettingsSection title={t('settings:helpSupportSection')}>
          <SettingsRow icon={<HeadsetIcon size={23} color={color} />} title={t('settings:helpSupport')} subtitle={t('settings:helpSupportSubtitle')} onPress={() => router.push('/settings/help-support')} />
          <SettingsRow icon={<SparkleIcon size={23} color={color} />} title={t('settings:whatsNew')} subtitle={t('settings:whatsNewSubtitle')} onPress={() => router.push('/settings/whats-new')} />
          <SettingsRow icon={<FileTextIcon size={23} color={color} />} title={t('settings:termsOfUse')} subtitle={t('settings:termsOfUseSubtitle')} onPress={() => router.push('/settings/terms-of-use')} />
        </SettingsSection>
        <SettingsSection title={t('settings:login')}>
          <SettingsRow destructive icon={<SignOutIcon size={23} color="#EF4444" />} title={t('common:logout')} onPress={confirmLogout} />
        </SettingsSection>
        <Text className="pb-8 pt-2 text-center text-xs text-gray-400">
          {t('settings:appVersion', { version: Constants.expoConfig?.version ?? '—' })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
