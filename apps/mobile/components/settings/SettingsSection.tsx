import Text from '@/components/common/AppText';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import useSettingsDirection from '@/components/settings/useSettingsDirection';

export default function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  const { rowStyle, textStyle } = useSettingsDirection();

  return (
    <View className="mt-6 bg-surface py-2 dark:bg-black" style={rowStyle}>
      <Text
        weight="bold"
        className="mb-1 px-5 text-sm text-gray-500"
        style={textStyle}
      >
        {title}
      </Text>
      <View>{children}</View>
    </View>
  );
}
