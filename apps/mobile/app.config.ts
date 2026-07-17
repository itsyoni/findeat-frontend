import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT ?? "development";

  const isDevelopment = variant === "development";
  const isPreview = variant === "preview";

  const name = isDevelopment
    ? "FindEat Dev"
    : isPreview
      ? "FindEat Preview"
      : "FindEat";

  const bundleIdentifier = isDevelopment
    ? "com.itsyoni.findeat.dev"
    : isPreview
      ? "com.itsyoni.findeat.preview"
      : "com.itsyoni.findeat";

  const scheme = isDevelopment
    ? "findeat-dev"
    : isPreview
      ? "findeat-preview"
      : "findeat";

  return {
    ...config,

    name,
    slug: config.slug ?? "mobile",
    scheme,

    plugins: [
      ...(config.plugins ?? []),
      "@react-native-community/datetimepicker",
    ],

    ios: {
      ...config.ios,
      bundleIdentifier,
    },

    android: {
      ...config.android,
      package: bundleIdentifier,
    },
  };
};
