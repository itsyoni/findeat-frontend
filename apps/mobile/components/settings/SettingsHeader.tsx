import Text from '@/components/common/AppText';
import { useAppTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { TouchableOpacity, View } from 'react-native';

export default function SettingsHeader({ title }: { title: string }) {
  const { isDark } = useAppTheme();
  return (
    <View className="h-14 flex-row items-center border-b border-gray-100 px-4 dark:border-gray-800">
      <TouchableOpacity onPress={() => router.back()} hitSlop={12} className="p-2">
        <ArrowLeftIcon size={24} color={isDark ? '#FFF' : '#111'} />
      </TouchableOpacity>
      <Text weight="bold" className="ml-2 text-xl text-black dark:text-white">{title}</Text>
    </View>
  );
}
