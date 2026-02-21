import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Guest Access",
      credentials: {
        username: { label: "Username", type: "text" },
        passcode: { label: "Passcode", type: "text" },
      },
      async authorize(credentials) {
        const username = (credentials?.username as string)?.trim().toLowerCase()
        const passcode = credentials?.passcode as string

        if (!username || !passcode) return null

        try {
          const user = await prisma.user.findUnique({
            where: { username },
          })

          if (!user) return null
          if (user.guestPasscode !== passcode) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error("Error in guest auth:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // On first sign-in, look up the real MongoDB _id by email.
        // This is critical for Google OAuth where user.id is Google's sub, not our DB id.
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
        token.id = dbUser?.id ?? user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
})
