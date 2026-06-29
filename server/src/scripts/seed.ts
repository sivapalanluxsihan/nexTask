import dotenv from 'dotenv';
import path from 'path';

import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/hash.util';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const email = requireEnv('SEED_ADMIN_EMAIL');
  const password = requireEnv('SEED_ADMIN_PASSWORD');
  const name = process.env.SEED_ADMIN_NAME ?? 'Administrator';

  console.log('🔐 Hashing password...');
  const passwordHash = await hashPassword(password);

  console.log('📦 Upserting administrator account...');
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: passwordHash,
      name,
      role: 'ADMIN',
      mustResetPassword: false,
    },
    update: {
      password: passwordHash,
      name,
      role: 'ADMIN',
      mustResetPassword: false,
    },
  });

  console.log('\n✅ Administrator account ready.');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
