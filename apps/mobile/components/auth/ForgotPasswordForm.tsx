import Text from '@/components/common/AppText';
import { TextInput } from '@/components/common';
import { api } from '@/lib/api';
import { getErrorMessage } from '@findeat/utils';
import { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = { onBack: () => void; initialEmail?: string; useBottomSheetInput?: boolean };

export default function ForgotPasswordForm({ onBack, initialEmail = '', useBottomSheetInput = true }: Props) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    try {
      setLoading(true);
      await api.auth.forgotPassword(email.trim());
      setRequested(true);
    } catch (error) {
      Alert.alert(t('common:error'), getErrorMessage(error, t('resetRequestFailed')));
    } finally { setLoading(false); }
  }

  async function reset() {
    try {
      setLoading(true);
      await api.auth.resetPassword(email.trim(), code, password);
      Alert.alert(t('passwordChanged'), t('passwordChangedBody'));
      onBack();
    } catch (error) {
      Alert.alert(t('resetFailed'), getErrorMessage(error, t('invalidCode')));
    } finally { setLoading(false); }
  }

  return (
    <View>
      <Text weight="bold" className="text-center text-2xl text-[#212121] dark:text-white">{t('forgotPassword')}</Text>
      <Text className="mb-6 mt-2 text-center text-gray-500">{requested ? t('resetCodeSent') : t('forgotPasswordBody')}</Text>
      <View className="gap-4">
        <TextInput useBottomSheetInput={useBottomSheetInput} value={email} onChangeText={setEmail} editable={!requested} placeholder={t('email')} keyboardType="email-address" autoCapitalize="none" className="border border-[#D8D3CA] bg-[#F1EEE8] dark:border-gray-600 dark:bg-gray-800" />
        {requested ? <>
          <TextInput useBottomSheetInput={useBottomSheetInput} value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} placeholder={t('verificationCode')} keyboardType="number-pad" maxLength={6} className="border border-[#D8D3CA] bg-[#F1EEE8] dark:border-gray-600 dark:bg-gray-800" />
          <TextInput useBottomSheetInput={useBottomSheetInput} value={password} onChangeText={setPassword} placeholder={t('newPassword')} isPassword className="border border-[#D8D3CA] bg-[#F1EEE8] dark:border-gray-600 dark:bg-gray-800" />
        </> : null}
        <TouchableOpacity disabled={loading || !email.trim() || (requested && (code.length !== 6 || password.length < 8))} onPress={() => void (requested ? reset() : requestCode())} className="rounded-2xl bg-[#212121] py-4 disabled:opacity-40 dark:bg-white">
          <Text weight="bold" className="text-center text-white dark:text-black">{loading ? t('pleaseWait') : requested ? t('resetPassword') : t('sendResetCode')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack}><Text className="text-center text-gray-500">{t('backToLogin')}</Text></TouchableOpacity>
      </View>
    </View>
  );
}
