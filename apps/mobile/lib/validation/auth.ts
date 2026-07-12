import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const restaurantSignupSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and _",
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  restaurantName: z.string().trim().min(1, "Restaurant name is required"),
  city: z.string().trim().min(1, "City is required"),
  address: z.string().trim().min(1, "Address is required"),
  latitude: z.number(),
  longitude: z.number(),
  mapboxId: z.string().min(1, "Address is required"),
  bio: z.string().trim().max(500).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type RestaurantSignupFormData = z.infer<typeof restaurantSignupSchema>;
