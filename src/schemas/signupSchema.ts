import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be atleast 3 characters long")
  .max(20, "Username must be atmost 3 characters long")
  .regex(/^[a-zA-Z0-9]+$/, "Username must not contain any special character");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email provided" }),
  password: z.string().min(8, "Password must be atleast 8 characters long"),
});

