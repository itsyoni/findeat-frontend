import Text from '@/components/common/AppText';
import SettingsHeader from '@/components/settings/SettingsHeader';
import { privacySections, termsSections, type LegalSection } from '@/constants/legal';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

function Section({ section }: { section: LegalSection }) {
  const { isDark } = useAppTheme();
  const openEmail = (value: string) => {
    const match = value.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    if (match) void Linking.openURL(`mailto:${match[0]}`);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text weight="bold" style={{ color: isDark ? '#FFF' : '#171717', fontSize: 19, marginBottom: 9 }}>{section.title}</Text>
      {section.paragraphs?.map((paragraph) => {
        const isEmail = paragraph.includes('@findeat.space');
        return isEmail ? (
          <TouchableOpacity key={paragraph} onPress={() => openEmail(paragraph)}>
            <Text selectable style={{ color: '#D99100', fontSize: 15, lineHeight: 23, marginBottom: 7 }}>{paragraph}</Text>
          </TouchableOpacity>
        ) : (
          <Text selectable key={paragraph} style={{ color: isDark ? '#D1D5DB' : '#4B5563', fontSize: 15, lineHeight: 23, marginBottom: 7 }}>{paragraph}</Text>
        );
      })}
      {section.bullets?.map((bullet) => (
        <View key={bullet} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 5, paddingRight: 6 }}>
          <Text style={{ color: '#F4B942', fontSize: 18, marginRight: 9, lineHeight: 22 }}>•</Text>
          <Text selectable style={{ flex: 1, color: isDark ? '#D1D5DB' : '#4B5563', fontSize: 15, lineHeight: 22 }}>{bullet}</Text>
        </View>
      ))}
    </View>
  );
}

export default function TermsOfUseScreen() {
  const { t } = useTranslation('settings');
  const { isDark } = useAppTheme();
  const colors = { background: isDark ? '#000' : '#FBFAF8', surface: isDark ? '#111' : '#FFF', border: isDark ? '#282828' : '#E7E1D8', text: isDark ? '#FFF' : '#171717', muted: isDark ? '#9CA3AF' : '#6B7280' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <SettingsHeader title={t('termsOfUse')} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 56 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 24, padding: 20 }}>
          <Text weight="bold" style={{ color: colors.text, fontSize: 28 }}>FindEat Terms of Use</Text>
          <Text weight="medium" style={{ color: '#D99100', marginTop: 7 }}>Effective Date: July 2026</Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 18, marginBottom: 26 }}>
            Welcome to FindEat. These Terms of Use (&quot;Terms&quot;) govern your access to and use of the FindEat mobile application, website, and related services (collectively, the &quot;Service&quot;). By creating an account or using FindEat, you agree to these Terms.
          </Text>
          {termsSections.map((section) => <Section key={section.title} section={section} />)}

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
          <Text weight="bold" style={{ color: colors.text, fontSize: 28, marginTop: 20 }}>FindEat Privacy Policy</Text>
          <Text weight="medium" style={{ color: '#D99100', marginTop: 7 }}>Effective Date: July 2026</Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 18, marginBottom: 26 }}>
            FindEat respects your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices available to you.
          </Text>
          {privacySections.map((section) => <Section key={section.title} section={section} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
