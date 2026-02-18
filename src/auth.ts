import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Guest Access",
      credentials: {},
      async authorize() {
        // Create or return a dummy guest user
        // For simplicity in this demo, we might want to just return a fixed dummy user 
        // OR create a new one each time.
        // Let's creating a new guest user if one doesn't exist for the session?
        // Actually, for a "demo", we can just use a specific hardcoded ID or email.
        
        const guestEmail = `guest-${Date.now()}@example.com`
        
        // We can create a user directly in DB
        try {
            const user = await prisma.user.create({
                data: {
                    email: guestEmail,
                    name: "Guest User",
                    isGuest: true,
                }
            })
            return user;
        } catch (e) {
            console.error("Failed to create guest user (likely no DB connection)", e)
            // Fallback for demo without DB
            return {
                id: "guest-offline",
                name: "Guest (Demo)",
                email: "guest@demo.local",
                isGuest: true,
                emailVerified: null,
                image: null,
            }
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        if (token?.sub) {
           session.user.id = token.sub
        }
      }
      return session
    },
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id
        }
        return token
    }
  },
  session: {
    strategy: "jwt",
  },
})
