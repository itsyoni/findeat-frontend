import LegalDocumentScreen from "@/components/settings/LegalDocumentScreen";
import { LEGAL_URLS, TERMS_OF_SERVICE } from "@findeat/legal";
import { useTranslation } from "react-i18next";

export default function TermsOfServiceScreen() {
  const { t } = useTranslation("settings");

  return (
    <LegalDocumentScreen
      document={TERMS_OF_SERVICE}
      onlineUrl={LEGAL_URLS.terms}
      screenTitle={t("termsOfService")}
      viewOnlineLabel={t("viewOnline")}
    />
  );
}
