import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const email = process.argv[2] || 'marufibnhossain@gmail.com';
const result = await prisma.user.updateMany({
  where: { email },
  data: { isAdmin: true },
});
console.log('Updated', result.count, 'user(s) to admin for', email);
await prisma.$disconnect();
