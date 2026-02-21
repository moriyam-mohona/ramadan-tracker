import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
      },
      async authorize(credentials) {
        const username = credentials?.username as string

        if (!username) return null

        // 1. Try to find existing user
        try {
          const existingUser = await prisma.user.findUnique({
            where: { username },
          })

          if (existingUser) {
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
            }
          }

          // 2. If not found, create new user
          const newUser = await prisma.user.create({
            data: {
              username,
              name: username,
              isGuest: true,
              email: `guest-${username}@example.com`,
            },
          })

          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            image: newUser.image,
          }
        } catch (error) {
          console.error("Error in guest auth:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // For Credentials provider, user.id is the DB id
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub
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
