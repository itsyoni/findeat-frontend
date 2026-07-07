import { AppButton, IconButton } from "@/components/common";
import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import FormInput from "@/components/forms/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getErrorMessage, uploadImage } from "@findeat/utils";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LANGUAGE_KEY } from "@/constants/storage";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { t, i18n } = useTranslation(["profile", "common", "settings"]);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [newCoverUri, setNewCoverUri] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout, refreshUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [original, setOriginal] = useState<{
    username: string;
    displayName: string;
    bio: string;
    email: string;
  }>({
    username: "",
    displayName: "",
    bio: "",
    email: "",
  });

  const displayedAvatar = newAvatarUri || avatarUrl;

  const hasChanges =
    username !== original.username ||
    displayName !== original.displayName ||
    bio !== (original.bio ?? "") ||
    email !== original.email ||
    password.trim() !== "" ||
    newAvatarUri !== null ||
    newCoverUri !== null;

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api.users.me();
      setOriginal({
        username: data.username ?? "",
        displayName: data.displayName ?? "",
        bio: data.bio ?? "",
        email: data.email ?? "",
      });
      setAvatarUrl(data.avatarUrl ?? null);
      setUsername(data.username ?? "");
      setBio(data.bio ?? "");
      setDisplayName(data.displayName ?? "");
      setCoverUrl(data.coverUrl ?? null);
      setEmail(data.email ?? "");
    } catch (error) {
      console.error(error);
    }
  }

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
        email: email.trim(),
        password: password.trim() || undefined,
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
    async function openCamera() {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t("common:permissionRequired"),
          t("profile:cameraPermission"),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        onSelect(result.assets[0].uri);
      }
    }

    async function openLibrary() {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t("common:permissionRequired"),
          t("profile:libraryPermission"),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect,
        quality: 0.8,
      });

      if (!result.canceled) {
        onSelect(result.assets[0].uri);
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

  async function setAppLanguage(language: "en" | "he") {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_KEY, language);

    await api.users.updateMe({
      language: language === "he" ? "HE" : "EN",
    });

    await refreshUser();
  }

  function changeLanguage() {
    Alert.alert(t("settings:chooseLanguage"), undefined, [
      {
        text: t("settings:english"),
        onPress: () => setAppLanguage("en"),
      },
      {
        text: t("settings:hebrew"),
        onPress: () => setAppLanguage("he"),
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 pt-4">
          <IconButton
            icon={CaretLeftIcon}
            variant="ghost"
            onPress={handleBack}
          />

          <Text className="ml-2 text-2xl font-bold text-black">
            {t("profile:editProfile")}
          </Text>
        </View>
        <View className="px-5 pb-10">
          <TouchableOpacity
            onPress={() => pickImage([3, 1], setNewCoverUri)}
            className="mt-6 h-40 overflow-hidden rounded-3xl bg-gray-100"
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

            <Text className="mt-3 font-semibold text-black">
              {t("profile:changeProfilePhoto")}
            </Text>
          </TouchableOpacity>

          <AppButton
            title={t("settings:language")}
            onPress={changeLanguage}
            variant="secondary"
          />

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

          <FormInput
            label={t("common:email")}
            value={email}
            onChangeText={setEmail}
            placeholder={t("common:email")}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <FormInput
            label={t("profile:newPassword")}
            value={password}
            onChangeText={setPassword}
            placeholder={t("profile:passwordPlaceholder")}
            isPassword
          />

          <AppButton
            title={loading ? t("common:saving") : t("common:save")}
            onPress={saveProfile}
            disabled={loading}
          />

          <AppButton
            title={t("common:logout")}
            onPress={() =>
              Alert.alert(t("common:logout"), t("profile:logoutConfirmation"), [
                {
                  text: t("common:cancel"),
                  style: "cancel",
                },
                {
                  text: t("common:logout"),
                  style: "destructive",
                  onPress: logout,
                },
              ])
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="mt-8 mb-3 text-xl font-bold text-black">{title}</Text>
  );
}
