import type { PostVisibility } from "@findeat/types";
import {
  GlobeHemisphereWestIcon,
  LockIcon,
  UsersThreeIcon,
} from "phosphor-react-native";

type Props = {
  visibility: PostVisibility;
  color: string;
  size?: number;
};

export default function PostVisibilityIcon({
  visibility,
  color,
  size = 14,
}: Props) {
  if (visibility === "PRIVATE") {
    return <LockIcon size={size} color={color} weight="fill" />;
  }

  if (visibility === "FRIENDS") {
    return <UsersThreeIcon size={size} color={color} weight="fill" />;
  }

  return <GlobeHemisphereWestIcon size={size} color={color} weight="fill" />;
}
