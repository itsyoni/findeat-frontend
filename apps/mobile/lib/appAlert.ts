import { Alert as NativeAlert } from "react-native";
import type { AlertButton, AlertOptions } from "react-native";

export type AppAlertRequest = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
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
    options?: AlertOptions,
  ) {
    if (!handler) {
      NativeAlert.alert(title, message, buttons, options);
      return;
    }

    handler({ title, message, buttons, options });
  },
};
