import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        // Миграции идут через прямое подключение (Supabase session pooler / direct, порт 5432).
        // Приложение в рантайме использует DATABASE_URL (transaction pooler, порт 6543).
        url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    },
});
