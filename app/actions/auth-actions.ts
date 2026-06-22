"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(prevState: any, formData: FormData) {
    try {
        await signIn("credentials", Object.fromEntries(formData));
        return { success: true, error: null }; // This won't actually be reached on success due to Next.js redirect
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials. Please check your email and password." };
                default:
                    return { error: "An unexpected authentication error occurred." };
            }
        }
        // Next.js redirect errors need to be rethrown
        throw error;
    }
}
