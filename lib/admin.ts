import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export type AdminSession = {
  user: { id: string; email: string; name?: string; isAdmin: boolean };
};

/**
 * Returns the current session only if the user is an admin. Otherwise null.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as { id?: string }).id) {
    return null;
  }
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) return null;
  return {
    user: {
      id: (session.user as { id: string }).id,
      email: session.user.email,
      name: session.user.name ?? undefined,
      isAdmin: true,
    },
  };
}
