const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NyayAI database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nyayai.in' },
    update: {},
    create: {
      email: 'admin@nyayai.in',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  const clientPassword = await bcrypt.hash('Client@123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@nyayai.in' },
    update: {},
    create: {
      email: 'client@nyayai.in',
      passwordHash: clientPassword,
      role: 'CLIENT',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Rahul Sharma',
          phone: '+91-9876543210',
          city: 'Mumbai',
          state: 'Maharashtra',
          preferredLanguage: 'en',
        },
      },
    },
  });
  console.log('✅ Demo client created:', client.email);

  const lawyerPassword = await bcrypt.hash('Lawyer@123', 12);
  const lawyer = await prisma.user.upsert({
    where: { email: 'lawyer@nyayai.in' },
    update: {},
    create: {
      email: 'lawyer@nyayai.in',
      passwordHash: lawyerPassword,
      role: 'LAWYER',
      isVerified: true,
      lawyerProfile: {
        create: {
          fullName: 'Adv. Priya Mehta',
          barCouncilNumber: 'MH/12345/2010',
          enrollmentState: 'Maharashtra',
          specializations: ['Criminal', 'Civil', 'Family'],
          experienceYears: 14,
          languages: ['Hindi', 'English', 'Marathi'],
          city: 'Mumbai',
          state: 'Maharashtra',
          bio: 'Senior advocate with 14 years of experience in criminal and civil law.',
          consultationFee: 1500.00,
          isVerified: true,
          isAvailable: true,
          rating: 4.8,
          totalReviews: 127,
        },
      },
    },
  });
  console.log('✅ Demo lawyer created:', lawyer.email);

  const org = await prisma.organization.upsert({
    where: { apiKey: 'demo_org_api_key_nyayai' },
    update: {},
    create: {
      name: 'Mehta & Associates',
      type: 'LAW_FIRM',
      email: 'info@mehtaassociates.in',
      phone: '+91-22-12345678',
      city: 'Mumbai',
      state: 'Maharashtra',
      plan: 'PROFESSIONAL',
      isActive: true,
      apiKey: 'demo_org_api_key_nyayai',
    },
  });
  console.log('✅ Demo organization created:', org.name);

  console.log('\n🎉 Seeding complete!');
  console.log('\nDemo credentials:');
  console.log('  Admin:  admin@nyayai.in / Admin@123');
  console.log('  Client: client@nyayai.in / Client@123');
  console.log('  Lawyer: lawyer@nyayai.in / Lawyer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });