import { PrismaClient } from './generated/prisma';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Абсолютный путь к dev.db в корне проекта
  const dbPath = path.join(process.cwd(), 'dev.db');
  return `file:${dbPath}`;
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: getDatabaseUrl(),
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
