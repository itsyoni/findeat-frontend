import { AppButton, IconButton } from "@/components/common";
import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import FormInput from "@/components/forms/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getErrorMessage, uploadImage } from "@findeat/utils";
import ImageCropPicker from "react-native-image-crop-picker";
import { router } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/contexts/ThemeContext";

export default function EditProfileScreen() {
  const { t } = useTranslation(["profile", "common"]);
  const { isDark } = useAppTheme();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [newCoverUri, setNewCoverUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [original, setOriginal] = useState<{
    username: string;
    displayName: string;
    bio: string;
  }>({
    username: "",
    displayName: "",
    bio: "",
  });

  const displayedAvatar = newAvatarUri || avatarUrl;

  const hasChanges =
    username !== original.username ||
    displayName !== original.displayName ||
    bio !== (original.bio ?? "") ||
    newAvatarUri !== null ||
    newCoverUri !== null;

  useEffect(() => {
    let cancelled = false;

    api.users
      .me()
      .then((data) => {
        if (cancelled) return;

        setOriginal({
          username: data.username ?? "",
          displayName: data.displayName ?? "",
          bio: data.bio ?? "",
        });
        setAvatarUrl(data.avatarUrl ?? null);
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setDisplayName(data.displayName ?? "");
        setCoverUrl(data.coverUrl ?? null);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile() {
    if (!username.trim()) {
      Alert.alert(
        t("profile:missingUsername"),
        t("profile:missingUsernameDescription"),
      );
      return;
    }

    if (!displayName.trim()) {
      Alert.alert(
        t("profile:missingDisplayName"),
        t("profile:missingDisplayNameDescription"),
      );
      return;
    }

    try {
      setLoading(true);

      const finalCoverUrl = newCoverUri
        ? await uploadImage(newCoverUri)
        : coverUrl;
      const finalAvatarUrl = newAvatarUri
        ? await uploadImage(newAvatarUri)
        : avatarUrl;

      await api.users.updateMe({
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim() || null,
        avatarUrl: finalAvatarUrl ?? undefined,
        coverUrl: finalCoverUrl,
      });

      await refreshUser();
      router.back();
    } catch (error) {
      console.error(error);

      Alert.alert(
        t("common:error"),
        getErrorMessage(error, t("profile:updateError")),
      );
    } finally {
      setLoading(false);
    }
  }

  async function pickImage(
    aspect: [number, number],
    onSelect: (uri: string) => void,
  ) {
    const isAvatar = aspect[0] === aspect[1];
    const cropOptions = {
      width: isAvatar ? 1000 : 1800,
      height: isAvatar ? 1000 : 600,
      cropping: true,
      cropperCircleOverlay: isAvatar,
      freeStyleCropEnabled: false,
      mediaType: "photo" as const,
      compressImageQuality: 0.8,
      forceJpg: true,
      cropperToolbarTitle: isAvatar
        ? t("profile:cropProfilePhoto")
        : t("profile:cropCoverPhoto"),
    };

    async function openCamera() {
      try {
        const image = await ImageCropPicker.openCamera(cropOptions);
        onSelect(image.path);
      } catch (error) {
        if ((error as { code?: string }).code !== "E_PICKER_CANCELLED") {
          Alert.alert(t("common:error"), t("profile:imagePickerError"));
        }
      }
    }

    async function openLibrary() {
      try {
        const image = await ImageCropPicker.openPicker(cropOptions);
        onSelect(image.path);
      } catch (error) {
        if ((error as { code?: string }).code !== "E_PICKER_CANCELLED") {
          Alert.alert(t("common:error"), t("profile:imagePickerError"));
        }
      }
    }

    async function removeProfilePicture() {
      try {
        const result = await api.users.removeAvatar();

        setAvatarUrl(result.avatarUrl);
        setNewAvatarUri(null);
      } catch (error) {
        console.error(error);
        Alert.alert(
          t("common:error"),
          getErrorMessage(error, t("profile:removeProfilePictureError")),
        );
      }
    }

    Alert.alert(t("profile:chooseImage"), t("profile:chooseImageDescription"), [
      {
        text: t("profile:takePhoto"),
        onPress: openCamera,
      },
      {
        text: t("profile:chooseFromLibrary"),
        onPress: openLibrary,
      },
      {
        text: t("profile:removeProfilePicture"),
        style: "destructive",
        onPress: removeProfilePicture,
      },
      {
        text: t("common:cancel"),
        style: "cancel",
      },
    ]);
  }

  async function pickAvatar() {
    await pickImage([1, 1], setNewAvatarUri);
  }

  function handleBack() {
    if (!hasChanges) {
      router.back();
      return;
    }

    Alert.alert(
      t("profile:unsavedChanges"),
      t("profile:unsavedChangesDescription"),
      [
        {
          text: t("common:cancel"),
          style: "cancel",
        },
        {
          text: t("profile:discard"),
          style: "destructive",
          onPress: () => router.back(),
        },
        {
          text: t("common:save"),
          onPress: saveProfile,
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FFF" }}
    >
      <ScrollView
        className="flex-1 bg-white dark:bg-black"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View className="flex-row items-center px-5 pt-4">
          <IconButton
            icon={CaretLeftIcon}
            variant="ghost"
            onPress={handleBack}
          />

          <Text className="ml-2 text-2xl font-bold text-black dark:text-white">
            {t("profile:editProfile")}
          </Text>
        </View>
        <View className="px-5 pb-10">
          <TouchableOpacity
            onPress={() => pickImage([3, 1], setNewCoverUri)}
            className="mt-6 h-40 overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800"
          >
            {newCoverUri || coverUrl ? (
              <Image
                source={{ uri: newCoverUri ?? coverUrl ?? "" }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Text className="text-gray-500">
                  {t("profile:addCoverPhoto")}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickAvatar}
            className={"mt-8 items-center"}
          >
            <Avatar uri={displayedAvatar} username={username} size={96} />

            <Text className="mt-3 font-semibold text-black dark:text-white">
              {t("profile:changeProfilePhoto")}
            </Text>
          </TouchableOpacity>

          <SectionTitle title={t("profile:account")} />

          <FormInput
            label={t("profile:displayName")}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t("profile:displayName")}
          />

          <FormInput
            label={t("common:username")}
            value={username}
            onChangeText={setUsername}
            placeholder={t("common:username")}
            autoCapitalize="none"
          />

          <FormInput
            label={t("profile:bio")}
            value={bio}
            onChangeText={setBio}
            placeholder={t("profile:bioPlaceholder")}
            multiline
          />

          <AppButton
            title={loading ? t("common:saving") : t("common:save")}
            onPress={saveProfile}
            disabled={loading}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="mb-3 mt-8 text-xl font-bold text-black dark:text-white">
      {title}
    </Text>
  );
}
