import Text from '@/components/common/AppText';
import { useAppTheme } from '@/contexts/ThemeContext';
import type { ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';
import DirectionalIcon from '@/components/common/icons/DirectionalIcon';
import useSettingsDirection from '@/components/settings/useSettingsDirection';

type Props = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
  valueEmphasis?: boolean;
};

export default function SettingsRow({ icon, title, subtitle, value, onPress, destructive, valueEmphasis }: Props) {
  const { isDark } = useAppTheme();
  const { rowStyle, textStyle } = useSettingsDirection();

  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} activeOpacity={0.65} className="flex-row items-center px-5 py-4" style={rowStyle}>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-gray-900" style={{ marginEnd: 16 }}>{icon}</View>
      <View className="flex-1">
        <Text
          className={`text-base ${destructive ? 'text-red-500' : 'text-ink dark:text-white'}`}
          style={textStyle}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="mt-0.5 text-sm text-gray-500"
            style={textStyle}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text className={`text-sm font-bold ${valueEmphasis ? 'text-blue-500' : 'text-gray-500'}`} style={[textStyle, { marginEnd: 8 }]}>
          {value}
        </Text>
      ) : null}
      {!destructive ? <DirectionalIcon direction="forward" size={18} color={isDark ? '#666' : '#A09D97'} /> : null}
    </TouchableOpacity>
  );
}
