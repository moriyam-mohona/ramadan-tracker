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
      },
      async authorize(credentials) {
        const username = credentials?.username as string
        if (!username) return null

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
    async signIn({ user, account }) {
      // Handle Google OAuth — save user to DB if first time
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
              },
            })
          }
        } catch (error) {
          console.error("Error saving Google user:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        // Fetch the DB user to get the real ID
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          })
          if (dbUser) token.sub = dbUser.id
        } catch (error) {
          console.error("Error fetching user in jwt callback:", error)
        }
      } else if (user) {
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
