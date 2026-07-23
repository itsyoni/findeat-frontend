import { Redirect } from "expo-router";

export default function LegacyTermsOfUseScreen() {
  return <Redirect href="/settings/terms-of-service" />;
}
