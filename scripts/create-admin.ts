#!/usr/bin/env tsx
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
      out[key] = val;
    }
  }
  return out as { email?: string; password?: string; name?: string };
}

async function main() {
  const { email, password, name } = parseArgs();
  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts --email admin@example.com --password "YourPassword" [--name "Admin Name"]');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        password: hash,
        role: 'ADMIN',
        name: name ?? existing.name ?? 'Admin',
      },
    });
    console.log(`✅ Updated existing admin user: ${updated.email}`);
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        name: name ?? 'Admin',
        password: hash,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created admin user: ${created.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed to create/update admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

