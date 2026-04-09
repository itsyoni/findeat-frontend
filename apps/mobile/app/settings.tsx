import { ThemedButton } from "@/components/ThemedButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  ImageBackground,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { Icon } from "@/components/Icon";
import Pencil from "@/assets/icons/PencilSquareSolid.svg";
import { ThemedInput } from "@/components/ThemedInput";
import { useState } from "react";

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [pronouns, setPronouns] = useState(user?.pronouns ?? "");
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth/welcome");
  };

  // const handleRegister = async () => {
  //   if (
  //     !username.trim() ||
  //     !email.trim() ||
  //     !password.trim() ||
  //     !confirmPassword.trim()
  //   ) {
  //     Alert.alert("Missing fields", "Please fill in all fields.");
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     Alert.alert("Password mismatch", "Passwords do not match.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const response = await api.post("/auth/signup", {
  //       username: username.trim(),
  //       displayName: username.trim(),
  //       email: email.trim(),
  //       password,
  //     });

  //     await signIn({
  //       token: response.data.accessToken,
  //     });
  //     router.replace("/");
  //   } catch (error: any) {
  //     console.log(
  //       "Registration failed:",
  //       error?.response?.data || error.message,
  //     );

  //     const message =
  //       error?.response?.data?.message ||
  //       "Something went wrong. Please try again.";

  //     Alert.alert(
  //       "Registration failed",
  //       Array.isArray(message) ? message[0] : message,
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
          <View>
            <View className="relative">
              <ImageBackground
                source={require("@/assets/images/Cinderella_Castle_Perspectives_-_Banner_view.png")}
                className="w-full h-[200]"
                resizeMode="cover"
              />

              <View
                style={{ backgroundColor: "rgba(0, 0, 0, 0.30)" }}
                className="absolute inset-0 items-center justify-center"
              >
                <Icon Icon={Pencil} color="white" size={28} />
              </View>
            </View>

            <View className="self-center -mt-16">
              <View className="w-32 h-32 rounded-full border-8 border-white items-center justify-center">
                <View className="w-full h-full rounded-full overflow-hidden">
                  <Image
                    source={require("@/assets/images/portrait-white-man-isolated.jpg")}
                    className="w-full h-full"
                  />

                  <View
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.30)" }}
                    className="absolute inset-0 items-center justify-center"
                  >
                    <Icon Icon={Pencil} color="white" size={28} />
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="px-5 flex-1 flex flex-col items-center gap-5 justify-between">
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: "center",
                width: "100%",
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-1 w-full items-center gap-2">
                <View className="flex flex-row gap-5 items-center">
                  <View className="w-[25%] h-15 justify-center">
                    <Text className="font-cabinet-bold text-xl">Name</Text>
                  </View>
                  <ThemedInput
                    placeholder="Edit your name"
                    value={user?.displayName ?? ""}
                    onChangeText={(text) => setDisplayName(text)}
                    className="flex-1 bg-transparent h-15 pb-2 border-b border-[#212121]/30 rounded-none"
                  />
                </View>
                <View className="flex flex-row gap-5 items-center">
                  <View className="w-[25%] h-15 justify-center">
                    <Text className="font-cabinet-bold text-xl">Username</Text>
                  </View>
                  <ThemedInput
                    placeholder="Edit your name"
                    value={user?.username ?? ""}
                    onChangeText={(text) => setUsername(text)}
                    className="flex-1 bg-transparent h-15 pb-2 border-b border-[#212121]/30 rounded-none"
                  />
                </View>
                <View className="flex flex-row gap-5 items-center">
                  <View className="w-[25%] h-15 justify-center">
                    <Text className="font-cabinet-bold text-xl">Email</Text>
                  </View>
                  <ThemedInput
                    placeholder="Edit your email"
                    value={user?.email ?? ""}
                    onChangeText={(text) => setEmail(text)}
                    className="flex-1 bg-transparent h-15 pb-2 border-b border-[#212121]/30 rounded-none"
                  />
                </View>
                <View className="flex flex-row gap-5 items-center">
                  <View className="w-[25%] h-15 justify-center">
                    <Text className="font-cabinet-bold text-xl">Bio</Text>
                  </View>
                  <ThemedInput
                    placeholder="Edit your bio"
                    value={user?.bio ?? ""}
                    onChangeText={(text) => setBio(text)}
                    className="flex-1 bg-transparent h-15 pb-2 border-b border-[#212121]/30 rounded-none"
                  />
                </View>
                <View className="flex flex-row gap-5 items-center">
                  <View className="w-[25%] h-15 justify-center">
                    <Text className="font-cabinet-bold text-xl">
                      Phone Number
                    </Text>
                  </View>
                  <ThemedInput
                    placeholder="Edit your phone number"
                    value={user?.phoneNumber ?? ""}
                    onChangeText={(text) => setPhoneNumber(text)}
                    className="flex-1 bg-transparent h-15 pb-2 border-b border-[#212121]/30 rounded-none"
                  />
                </View>
                <View className="flex flex-row gap-5 items-center">
                  <View className="w-[25%] h-15 justify-center">
                    <Text className="font-cabinet-bold text-xl">Gender</Text>
                  </View>
                  <ThemedInput
                    placeholder="Edit your gender"
                    value={user?.gender ?? ""}
                    onChangeText={(text) => setGender(text)}
                    className="flex-1 bg-transparent h-15 pb-2 border-b border-[#212121]/30 rounded-none"
                  />
                </View>
                <View className="flex flex-row gap-5 items-center">
                  <View className="w-[25%] h-15 justify-center">
                    <Text className="font-cabinet-bold text-xl">Pronouns</Text>
                  </View>
                  <ThemedInput
                    placeholder="Edit your pronouns"
                    value={user?.pronouns ?? ""}
                    onChangeText={(text) => setPronouns(text)}
                    className="flex-1 bg-transparent h-15 pb-2 border-b border-[#212121]/30 rounded-none"
                  />
                </View>
              </View>
            </ScrollView>
            <View className="w-full pb-10">
              <ThemedButton
                onPress={handleLogout}
                className="w-full bg-red-500 py-2 rounded-lg"
              >
                <Text className="text-white font-cabinet-bold text-2xl">
                  Log out
                </Text>
              </ThemedButton>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}
