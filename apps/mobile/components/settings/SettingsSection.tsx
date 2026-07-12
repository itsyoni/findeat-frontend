import Text from '@/components/common/AppText';
import type { ReactNode } from 'react';
import { View } from 'react-native';

export default function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-6">
      <Text weight="bold" className="mb-1 px-5 text-sm text-gray-500">{title}</Text>
      <View>{children}</View>
    </View>
  );
}
