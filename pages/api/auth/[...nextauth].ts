import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

         if (!user.emailVerified) {
           // Signal a specific error so the client can show a clear message
           throw new Error('EMAIL_NOT_VERIFIED');
         }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          isAdmin: user.isAdmin ?? false,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id: string }).id = token.id as string;
        // Read isAdmin from DB on every session load (type-safe API; fallback to raw + token)
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isAdmin: true },
          });
          (session.user as { isAdmin?: boolean }).isAdmin = user?.isAdmin ?? false;
        } catch {
          try {
            const rows = await prisma.$queryRaw<[{ isAdmin?: number; isadmin?: number }]>`
              SELECT isAdmin FROM User WHERE id = ${token.id as string}
            `;
            const raw = rows[0];
            const value = raw?.isAdmin ?? raw?.isadmin;
            (session.user as { isAdmin?: boolean }).isAdmin = value === 1;
          } catch {
            (session.user as { isAdmin?: boolean }).isAdmin = (token.isAdmin as boolean) ?? false;
          }
        }
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

