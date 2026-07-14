import AppBottomSheet from '@/components/common/AppBottomSheet';
import Text from '@/components/common/AppText';
import { useAppTheme } from '@/contexts/ThemeContext';
import type { Message } from '@findeat/types';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { ArrowBendUpLeftIcon, CopyIcon, TrashIcon, UserMinusIcon, UsersIcon } from 'phosphor-react-native';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

type Props = {
  message: Message | null;
  isMine: boolean;
  onClose: () => void;
  onReply: (message: Message) => void;
  onDelete: (message: Message, scope: 'me' | 'everyone') => Promise<void>;
};

export default function MessageActionsBottomSheet({ message, isMine, onClose, onReply, onDelete }: Props) {
  const { t } = useTranslation('chat');
  const { isDark } = useAppTheme();
  const [showDeleteChoices, setShowDeleteChoices] = useState(false);
  const [deleting, setDeleting] = useState<'me' | 'everyone' | null>(null);
  const iconColor = isDark ? '#FFF' : '#171717';

  function close() {
    setShowDeleteChoices(false);
    setDeleting(null);
    onClose();
  }

  async function copy() {
    if (!message?.content) return;
    await Clipboard.setStringAsync(message.content);
    close();
  }

  async function remove(scope: 'me' | 'everyone') {
    if (!message || deleting) return;
    setDeleting(scope);
    try {
      await onDelete(message, scope);
      close();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <AppBottomSheet open={!!message} onClose={close} snapPoints={[showDeleteChoices ? '36%' : '44%']}>
      <BottomSheetView className="flex-1 px-4 pb-6 pt-1">
        {showDeleteChoices ? <>
          <Text className="px-2 pb-3 text-center text-xl font-bold text-black dark:text-white">{t('deleteMessage')}</Text>
          <ActionRow icon={<UserMinusIcon size={23} color="#EF4444" weight="duotone" />} title={t('deleteForMe')} destructive loading={deleting === 'me'} onPress={() => void remove('me')} />
          {isMine ? <ActionRow icon={<UsersIcon size={23} color="#EF4444" weight="duotone" />} title={t('deleteForEveryone')} destructive loading={deleting === 'everyone'} onPress={() => void remove('everyone')} /> : null}
          <TouchableOpacity className="mt-3 items-center rounded-2xl bg-gray-100 py-4 dark:bg-gray-800" onPress={() => setShowDeleteChoices(false)}>
            <Text className="font-bold text-black dark:text-white">{t('cancel')}</Text>
          </TouchableOpacity>
        </> : <>
          <Text className="px-2 pb-3 text-center text-xl font-bold text-black dark:text-white">{t('messageOptions')}</Text>
          <ActionRow icon={<ArrowBendUpLeftIcon size={23} color={iconColor} weight="duotone" />} title={t('reply')} onPress={() => { if (message) onReply(message); close(); }} />
          {message?.content ? <ActionRow icon={<CopyIcon size={23} color={iconColor} weight="duotone" />} title={t('copy')} onPress={() => void copy()} /> : null}
          <ActionRow icon={<TrashIcon size={23} color="#EF4444" weight="duotone" />} title={t('deleteMessage')} destructive onPress={() => setShowDeleteChoices(true)} />
        </>}
      </BottomSheetView>
    </AppBottomSheet>
  );
}

function ActionRow({ icon, title, onPress, destructive, loading }: { icon: ReactNode; title: string; onPress: () => void; destructive?: boolean; loading?: boolean }) {
  return <TouchableOpacity disabled={loading} onPress={onPress} className="mb-2 flex-row items-center rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-900">
    <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800">{loading ? <ActivityIndicator color="#EF4444" /> : icon}</View>
    <Text className={`text-base font-bold ${destructive ? 'text-red-500' : 'text-black dark:text-white'}`}>{title}</Text>
  </TouchableOpacity>;
}
