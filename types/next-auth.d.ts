
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: "ADMIN" | "USER" | "FOUNDER" | "PARENT"
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        role: "ADMIN" | "USER" | "FOUNDER" | "PARENT"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: "ADMIN" | "USER" | "FOUNDER" | "PARENT"
        id: string
    }
}
