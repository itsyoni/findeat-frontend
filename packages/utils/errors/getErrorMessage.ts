export function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response as {
      data?: {
        message?: string;
      };
    };

    return response.data?.message ?? fallback;
  }

  return fallback;
}
