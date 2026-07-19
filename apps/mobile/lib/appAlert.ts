import { Alert as NativeAlert } from "react-native";
import type { AlertButton, AlertOptions } from "react-native";

export type AppAlertTone = "default" | "success" | "warning";

export type AppAlertOptions = AlertOptions & {
  tone?: AppAlertTone;
};

export type AppAlertRequest = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AppAlertOptions;
};

type AlertHandler = (request: AppAlertRequest) => void;

let handler: AlertHandler | null = null;

export function registerAppAlertHandler(nextHandler: AlertHandler | null) {
  handler = nextHandler;
}

export const AppAlert = {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AppAlertOptions,
  ) {
    if (!handler) {
      const { tone: _tone, ...nativeOptions } = options ?? {};
      NativeAlert.alert(title, message, buttons, nativeOptions);
      return;
    }

    handler({ title, message, buttons, options });
  },
};
