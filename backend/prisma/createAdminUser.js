const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Provisions (or updates the password of) a SUPER_ADMIN account, deliberately
// outside the public /auth/register endpoint. Credentials come from env vars
// so nothing ever gets committed:
//
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' node prisma/createAdminUser.js
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node prisma/createAdminUser.js');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('ADMIN_PASSWORD must be at least 12 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'SUPER_ADMIN', isActive: true },
    create: { email, passwordHash, role: 'SUPER_ADMIN', isVerified: true },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  console.log(`SUPER_ADMIN ready: ${user.email} (id: ${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
