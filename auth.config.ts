import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const authConfig = {
    pages: {
        signIn: '/login', // Redirect here on auth failure / protection
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            console.log(`[DEBUG] Auth Check: ${nextUrl.pathname}`);
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role;

            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            // Protected Routes (everything except login, static, public)
            // Assuming the app is mostly protected.

            if (isOnDashboard) {
                if (isLoggedIn) {
                    // RBAC Check
                    // If USER role, they can ONLY access /dashboard (and sub-routes? Prompt says "User -> only dashboard")
                    // Assuming /dashboard is the main page for them.
                    // If they try to access other restricted pages (e.g. /config, /admin), redirect or block.
                    // The prompt says "2. Admin -> all the pages".

                    // Let's assume standard users can access /dashboard/* but NOT /config, /settings etc if those exist and are admin-only.
                    // For now, implicitely allow dashboard access for both.
                    // But if there are other pages like /admin or /settings that are not under /dashboard?
                    // The prompt implies a restriction. "User -> only dashboard".

                    // If User tries to go to a non-dashboard protected route (if any exist), redirect to dashboard.
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Logged in user navigating outside dashboard (e.g. root /, or /admin if it existed)
                // If page is public, fine. If page is protected and not dashboard?

                // If standard USER tries to access restricted areas (assuming /config or others are restricted)
                const isRestrictedPage = nextUrl.pathname.startsWith('/config') || nextUrl.pathname.startsWith('/admin');

                const baseUrl = process.env.AUTH_URL || nextUrl;

                if (isRestrictedPage && userRole !== 'ADMIN') {
                    return Response.redirect(new URL('/dashboard', baseUrl));
                }

                if (isOnLogin) {
                    return Response.redirect(new URL('/dashboard', baseUrl));
                }

                return true;
            } else if (isOnLogin) {
                return true; // Allow access to login page
            }

            // Default allow for other pages (like landing page /)
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.name = user.name;
            }
            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                token.role = session.user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
                session.user.name = token.name;
            }
            return session;
        }
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("[DEBUG] authorize called with emails:", credentials?.email);
                const parsedCredentials = z
                    .object({ email: z.string(), password: z.string().min(3) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    let { email, password } = parsedCredentials.data;
                    console.log("[DEBUG] Credentials parsed successfully for:", email);



                    console.log("[DEBUG] Quering DB for user...");
                    const user = await prisma.user.findUnique({ where: { email } });
                    console.log("[DEBUG] DB Result:", user ? "User Found" : "User Not Found");

                    if (!user) {
                        console.log("[DEBUG] User not found returning null");
                        return null;
                    }
                    if (!user.isActive) {
                        console.log("[DEBUG] User is inactive returning null");
                        return null; // Block inactive users
                    }

                    console.log("[DEBUG] Comparing passwords...");
                    const passwordsMatch = await bcrypt.compare(password, user.password || "");
                    console.log("[DEBUG] Password match result:", passwordsMatch);

                    if (passwordsMatch) return user;
                } else {
                    console.log("[DEBUG] Credential parsing failed:", parsedCredentials.error);
                }

                console.log("[DEBUG] Authorization failed, returning null");
                return null;
            },
        }),
    ],
} satisfies NextAuthConfig;
