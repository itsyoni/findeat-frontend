import Text from "@/components/common/AppText";
import { useAppTheme } from "@/contexts/ThemeContext";
import {
  type AppAlertRequest,
  registerAppAlertHandler,
} from "@/lib/appAlert";
import type { AlertButton } from "react-native";
import { Modal, Pressable, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useAppTheme();
  const { t, i18n } = useTranslation("common");
  const isRtl = i18n.language.startsWith("he");
  const [request, setRequest] = useState<AppAlertRequest | null>(null);

  useEffect(() => {
    registerAppAlertHandler(setRequest);
    return () => registerAppAlertHandler(null);
  }, []);

  const buttons = useMemo<AlertButton[]>(
    () =>
      request?.buttons?.length
        ? request.buttons
        : [{ text: t("ok") }],
    [request?.buttons, t],
  );

  const close = useCallback(
    (button?: AlertButton) => {
      const onPress = button?.onPress;
      const onDismiss = request?.options?.onDismiss;
      setRequest(null);

      requestAnimationFrame(() => {
        onPress?.();
        onDismiss?.();
      });
    },
    [request?.options?.onDismiss],
  );

  const cancelButton = buttons.find((button) => button.style === "cancel");
  const canDismissBackdrop = request?.options?.cancelable === true;
  const horizontalActions = buttons.length === 2;

  return (
    <>
      {children}
      <Modal
        visible={!!request}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => {
          if (cancelButton) close(cancelButton);
          else if (canDismissBackdrop) close();
        }}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 px-6"
          onPress={() => {
            if (canDismissBackdrop) close(cancelButton);
          }}
        >
          <Pressable
            accessibilityViewIsModal
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-black/5 bg-[#FBFAF8] p-5 shadow-2xl dark:border-white/10 dark:bg-[#171717]"
            onPress={(event) => event.stopPropagation()}
            style={{ direction: isRtl ? "rtl" : "ltr" }}
          >
            <View className="mb-5">
              <Text
                weight="bold"
                className="text-xl text-[#171717] dark:text-white"
                style={{
                  textAlign: "auto",
                  writingDirection: isRtl ? "rtl" : "ltr",
                }}
              >
                {request?.title}
              </Text>
              {request?.message ? (
                <Text
                  className="mt-2 text-base leading-6 text-[#706C66] dark:text-gray-300"
                  style={{
                    textAlign: "auto",
                    writingDirection: isRtl ? "rtl" : "ltr",
                  }}
                >
                  {request.message}
                </Text>
              ) : null}
            </View>

            <View
              className={horizontalActions ? "flex-row gap-2" : "gap-2"}
              style={{ direction: isRtl ? "rtl" : "ltr" }}
            >
              {buttons.map((button, index) => {
                const destructive = button.style === "destructive";
                const cancel = button.style === "cancel";
                const backgroundColor = destructive
                  ? "#DC2626"
                  : cancel
                    ? isDark
                      ? "#292929"
                      : "#EEEAE4"
                    : isDark
                      ? "#F4B942"
                      : "#171717";
                const textColor = destructive
                  ? "#FFFFFF"
                  : cancel
                    ? isDark
                      ? "#FFFFFF"
                      : "#171717"
                    : isDark
                      ? "#171717"
                      : "#FFFFFF";

                return (
                  <Pressable
                    key={`${button.text ?? "action"}-${index}`}
                    accessibilityRole="button"
                    onPress={() => close(button)}
                    className={`${horizontalActions ? "flex-1" : "w-full"} min-h-12 items-center justify-center rounded-2xl px-4 py-3 active:opacity-75`}
                    style={{ backgroundColor }}
                  >
                    <Text
                      weight="bold"
                      className="text-center text-base"
                      style={{ color: textColor }}
                    >
                      {button.text ?? t("ok")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
