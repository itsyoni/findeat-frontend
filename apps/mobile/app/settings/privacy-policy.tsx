import LegalDocumentScreen from "@/components/settings/LegalDocumentScreen";
import { LEGAL_URLS, PRIVACY_POLICY } from "@findeat/legal";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation("settings");

  return (
    <LegalDocumentScreen
      document={PRIVACY_POLICY}
      onlineUrl={LEGAL_URLS.privacy}
      screenTitle={t("privacyPolicy")}
      viewOnlineLabel={t("viewOnline")}
    />
  );
}
