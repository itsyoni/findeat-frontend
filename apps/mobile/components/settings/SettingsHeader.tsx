import Text from '@/components/common/AppText';
import { useAppTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { TouchableOpacity, View } from 'react-native';

export default function SettingsHeader({ title }: { title: string }) {
  const { isDark } = useAppTheme();
  return (
    <View className="h-14 flex-row items-center border-b border-line bg-surface px-4 dark:border-gray-800 dark:bg-black">
      <TouchableOpacity onPress={() => router.back()} hitSlop={12} className="p-2">
        <ArrowLeftIcon size={24} color={isDark ? '#FFF' : '#171717'} />
      </TouchableOpacity>
      <Text weight="bold" className="ml-2 text-xl text-ink dark:text-white">{title}</Text>
    </View>
  );
}
