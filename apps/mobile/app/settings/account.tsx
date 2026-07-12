import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsRow from '@/components/settings/SettingsRow';
import SettingsSection from '@/components/settings/SettingsSection';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { EnvelopeIcon, PencilSimpleIcon, UserIcon } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountSettingsScreen() {
  const { t } = useTranslation(['settings', 'profile']);
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const color = isDark ? '#FFF' : '#111';
  return <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FFF' }}>
    <SettingsHeader title={t('settings:account')} />
    <ScrollView>
      <SettingsSection title={t('settings:profileInformation')}>
        <SettingsRow icon={<PencilSimpleIcon size={22} color={color} />} title={t('profile:editProfile')} onPress={() => router.push('/(profile)/edit-profile')} />
        <SettingsRow icon={<UserIcon size={22} color={color} />} title={t('settings:username')} value={`@${user?.username ?? ''}`} onPress={() => router.push('/(profile)/edit-profile')} />
        <SettingsRow icon={<EnvelopeIcon size={22} color={color} />} title={t('settings:emailAddress')} value={user?.email} onPress={() => {}} />
      </SettingsSection>
    </ScrollView>
  </SafeAreaView>;
}
