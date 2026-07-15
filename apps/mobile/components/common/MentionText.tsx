import Text from "@/components/common/AppText";
import type { UserSummary } from "@findeat/types";
import { router } from "expo-router";
import type { ComponentProps } from "react";

type Mention = { user: UserSummary };
type Props = Omit<ComponentProps<typeof Text>, "children"> & {
  content: string;
  mentions?: Mention[];
};

const USERNAME_PATTERN = /@([A-Za-z0-9_]{3,20})\b/g;

export default function MentionText({ content, mentions = [], ...props }: Props) {
  const mentionedByUsername = new Map(
    mentions.map((mention) => [mention.user.username.toLowerCase(), mention.user]),
  );
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of content.matchAll(USERNAME_PATTERN)) {
    const index = match.index ?? 0;
    const user = mentionedByUsername.get(match[1]!.toLowerCase());
    if (!user) continue;

    if (index > cursor) parts.push(content.slice(cursor, index));
    parts.push(
      <Text
        key={`${index}-${user.id}`}
        weight="bold"
        className="text-amber-700 dark:text-amber-400"
        onPress={() =>
          router.push({ pathname: "/(users)/[id]", params: { id: user.id } })
        }
      >
        {match[0]}
      </Text>,
    );
    cursor = index + match[0].length;
  }

  if (cursor < content.length) parts.push(content.slice(cursor));
  return <Text {...props}>{parts.length ? parts : content}</Text>;
}
