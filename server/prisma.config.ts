/// <reference types="node" />
import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isCli = process.argv.some(arg => arg.includes('prisma'));
const dbUrl = isCli ? (process.env.DIRECT_URL ?? process.env.DATABASE_URL) : process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl ?? 'postgresql://user:password@localhost:5432/postgres',
    directUrl: process.env.DIRECT_URL,
  },
});
