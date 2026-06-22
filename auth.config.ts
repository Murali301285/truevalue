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

            const publicRoutes = ['/login', '/signup', '/terms', '/forgot-password', '/reset-password'];
            const isPublicRoute = publicRoutes.some(route => nextUrl.pathname.startsWith(route)) || nextUrl.pathname === '/';

            const isRestrictedAdminPage = nextUrl.pathname.startsWith('/config') || nextUrl.pathname.startsWith('/payments');

            // 1. If it's a public route and user is logged in, redirect away from login/signup
            if (isLoggedIn && (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup'))) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // 2. If it's a public route, allow access
            if (isPublicRoute) {
                return true;
            }

            // 3. For ALL OTHER ROUTES (Protected), require login
            if (!isLoggedIn) {
                return false; // Redirects to signIn page automatically
            }

            // 4. Role-Based Access Control for restricted admin pages
            if (isRestrictedAdminPage && userRole !== 'ADMIN') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.name = user.name;
                token.image = user.image;
            }
            if (trigger === "update" && session) {
                // NextAuth update(data) passes data directly as the session parameter
                if (session.name !== undefined) token.name = session.name;
                if (session.image !== undefined) token.image = session.image;
                if (session.role !== undefined) token.role = session.role;
                
                // Fallback just in case it is ever passed wrapped
                if (session.user) {
                    if (session.user.name !== undefined) token.name = session.user.name;
                    if (session.user.image !== undefined) token.image = session.user.image;
                    if (session.user.role !== undefined) token.role = session.user.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
                session.user.name = token.name;
                session.user.image = token.image as string | null | undefined;
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

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            image: user.image,
                        };
                    }
                } else {
                    console.log("[DEBUG] Credential parsing failed:", parsedCredentials.error);
                }

                console.log("[DEBUG] Authorization failed, returning null");
                return null;
            },
        }),
    ],
} satisfies NextAuthConfig;
