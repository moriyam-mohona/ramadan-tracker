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
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string
        
        if (!username) return null

        // 1. Try to find existing user
        try {
            const existingUser = await prisma.user.findUnique({
                where: { username }
            })

            if (existingUser) return existingUser

            // 2. If not found, create new user
            const newUser = await prisma.user.create({
                data: {
                    username,
                    name: username,
                    isGuest: true,
                    email: `guest-${username}@example.com`, // Dummy email
                }
            })
            return newUser
        } catch (error) {
            console.error("Error in guest auth:", error)
            return null
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
