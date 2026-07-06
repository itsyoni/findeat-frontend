export async function uploadImage(uri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary environment variables.");
  }

  const formData = new FormData();

  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "image.jpg",
  } as never);

  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    secure_url?: string;
    error?: {
      message: string;
    };
  };

  if (!response.ok || !data.secure_url) {
    throw new Error(
      data.error?.message ?? "Failed to upload image to Cloudinary.",
    );
  }

  return data.secure_url;
}
