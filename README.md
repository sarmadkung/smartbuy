# 📱 SmartBuy — Web + Mobile + API Monorepo (Next.js + Expo + NestJS + PostgreSQL + Drizzle)

SmartBuy is an online platform for discovering **handpicked, value-for-money** digital devices (phones, watches, etc.) with an **AI assistant** for analysis & recommendations.

This monorepo contains:

* **Web**: Next.js 15 (App Router, **SSR/ISR/RSC**) — SEO‑friendly storefront
* **Mobile**: Expo (React Native) — iOS/Android app via EAS
* **API**: NestJS service (Node 20) with PostgreSQL + Drizzle ORM
* **Shared UI**: React Native components reused across web & native via `react-native-web`

---

## 🧭 Table of Contents

1. [Tech Overview](#-tech-overview)
2. [Repo Structure](#-repo-structure)
3. [Prerequisites](#-prerequisites)
4. [Getting Started](#-getting-started)
5. [Rendering Strategy (SSR/ISR/SSG)](#-rendering-strategy-ssrisrssg)
6. [Backend (NestJS + Drizzle + Postgres)](#-backend-nestjs--drizzle--postgres)
7. [Key Configs (Web & Mobile)](#-key-configs-web--mobile)
8. [Environment Variables](#-environment-variables)
9. [Universal Abstractions (Web vs Native)](#-universal-abstractions-web-vs-native)
10. [Testing & Quality](#-testing--quality)
11. [Build & Deploy](#-build--deploy)
12. [Turbo Remote Caching](#-turbo-remote-caching)
13. [Example Shared Components](#-example-shared-components)
14. [Useful Links](#-useful-links)

---

## 🧱 Tech Overview

* **Web**: Next.js 15 (App Router, **Server Components**, **Server Actions**, **ISR**)
* **Mobile**: Expo SDK 52+ (EAS builds & submit)
* **API**: NestJS + PostgreSQL + Drizzle ORM (`drizzle-orm/node-postgres`)
* **UI**: React Native + `react-native-web` with **Tamagui** or **NativeWind** (choose one)
* **Data**: `packages/api-client` (tRPC or REST + Zod)
* **Tooling**: Turborepo + pnpm + TypeScript + ESLint + Prettier

---

## 📂 Repo Structure

```
apps/
  web/           # Next.js storefront (SSR/ISR)
  mobile/        # Expo app (iOS/Android)
  api/           # NestJS API (Postgres + Drizzle)
packages/
  ui/            # Universal RN components (no DOM/Node APIs)
  api-client/    # Isomorphic SDK (fetch/tRPC + zod types)
  db/            # Drizzle schema & helpers (imported by api & web)
  config/        # Shared tsconfig/eslint/tailwind/tamagui config
```

> Keep shared code DOM‑free; use platform wrappers for differences (see **Universal Abstractions**).

---

## ✅ Prerequisites

* **Node** 20+
* **pnpm** 9+
* **Docker** (for local Postgres)
* **Xcode** (macOS) for iOS simulator/builds
* **Android Studio** for Android emulator/builds
* Optional: **EAS CLI** (`npm i -g eas-cli`) for store builds/submit

---

## 🚀 Getting Started

Install dependencies (root):

```bash
pnpm install
```

Start local database (Docker):

```bash
# from repo root
docker compose up -d db
```

Run the apps (Turbo, parallel):

```bash
pnpm turbo run dev --parallel
```

Run individually:

```bash
pnpm turbo run dev --filter=web
pnpm turbo run dev --filter=mobile
pnpm turbo run dev --filter=api
```

* **Web (Next.js)**: `cd apps/web && pnpm dev` → [http://localhost:3000](http://localhost:3000)
* **Mobile (Expo)**: `cd apps/mobile && pnpm dev` → press `i` (iOS), `a` (Android), `w` (web preview)
* **API (NestJS)**: `cd apps/api && pnpm start:dev` → [http://localhost:4000](http://localhost:4000) (default)

---

## 🧠 Rendering Strategy (SSR/ISR/SSG)

**Use a hybrid approach for performance + freshness:**

| Route Type                    | Mode                         | Notes                                                                          |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| **Home / Category / Brand**   | **ISR**                      | `revalidate: 300–900s`                                                         |
| **Product Detail**            | **ISR** + **on‑demand tags** | `revalidate: 60–120s` + `revalidateTag('product:{id}')` on price/stock changes |
| **Search / Filters**          | **SSR**                      | Optional short CDN cache                                                       |
| **Cart / Checkout / Account** | **SSR** (no cache)           | User‑specific                                                                  |
| **Blog / Help / Static**      | **SSG** or long‑TTL ISR      | Rarely changes                                                                 |

---

## 🗄 Backend (NestJS + Drizzle + Postgres)

### Docker (local Postgres)

`docker-compose.yml` (snippet):

```yaml
services:
  db:
    image: postgres:16
    container_name: smartbuy-db
    environment:
      POSTGRES_DB: smartbuy
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10
volumes:
  db_data:
```

> If you plan to use embeddings, enable **pgvector** later: `CREATE EXTENSION IF NOT EXISTS vector;`

### Environment

`apps/api/.env`:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/smartbuy
PORT=4000
REVALIDATE_TOKEN=supersecret
```

### Drizzle schema (shared)

`packages/db/schema.ts`:

```ts
import { pgTable, serial, text, numeric, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

`drizzle.config.ts` (root):

```ts
import type { Config } from 'drizzle-kit';
export default {
  schema: './packages/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: { connectionString: process.env.DATABASE_URL! },
} satisfies Config;
```

### Drizzle commands

Add to **root** `package.json`:

```jsonc
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

Run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

### NestJS wiring

`apps/api/src/database/database.module.ts`:

```ts
import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: () => new Pool({ connectionString: process.env.DATABASE_URL }),
    },
    {
      provide: DRIZZLE,
      inject: ['PG_POOL'],
      useFactory: (pool: Pool) => drizzle(pool),
    },
  ],
  exports: [DRIZZLE, 'PG_POOL'],
})
export class DatabaseModule {}
```

`apps/api/src/products/product.repo.ts`:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { products } from 'packages/db/schema';
import { DRIZZLE } from '../database/database.module';

@Injectable()
export class ProductRepo {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  findBySlug(slug: string) {
    return this.db.select().from(products).where(eq(products.slug, slug)).limit(1);
  }
}
```

`apps/api/src/products/products.controller.ts`:

```ts
import { Controller, Get, Param } from '@nestjs/common';
import { ProductRepo } from './product.repo';

@Controller('products')
export class ProductsController {
  constructor(private readonly repo: ProductRepo) {}

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const [p] = await this.repo.findBySlug(slug);
    return p ?? { error: 'Not found' };
  }
}
```

`apps/api/src/products/products.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ProductRepo } from './product.repo';
import { ProductsController } from './products.controller';

@Module({ controllers: [ProductsController], providers: [ProductRepo] })
export class ProductsModule {}
```

`apps/api/src/main.ts`:

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
```

`apps/api/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';

@Module({ imports: [DatabaseModule, ProductsModule] })
export class AppModule {}
```

### Web → API integration

`packages/api-client/products.ts`:

```ts
export async function fetchProductBySlug(slug: string, opts?: { minimal?: boolean }) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const res = await fetch(`${base}/products/${slug}`, { next: { tags: [`product:${slug}`] } });
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}
```

> On price/stock update in the API, POST to the web’s `/api/revalidate` route with the corresponding tag to refresh ISR.

---

## 🔧 Key Configs (Web & Mobile)

### Next.js ↔︎ React Native Web

`apps/web/next.config.ts`

```ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: { serverActions: true },
  transpilePackages: [
    'react-native',
    'react-native-web',
    '@expo/vector-icons',
    'react-native-svg',
    'packages/ui',
  ],
  webpack: (cfg) => {
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = { ...(cfg.resolve.alias || {}), 'react-native$': 'react-native-web' };
    return cfg;
  },
};
export default config;
```

### Expo Metro (monorepo friendly)

`apps/mobile/metro.config.js`

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
];

module.exports = config;
```

### ISR & On‑Demand Revalidation (Web)

**Page with time‑based ISR**

`apps/web/app/(shop)/products/[slug]/page.tsx`

```tsx
import { fetchProductBySlug } from 'packages/api-client/products';
import { ProductScreen } from 'packages/ui/ProductScreen';

export const revalidate = 120; // seconds

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug); // server (RSC)
  return <ProductScreen product={product} />;
}
```

**Precise invalidation (tags)**

Server fetch with tags:

```ts
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
  next: { tags: [`product:${id}`] },
});
```

API route to trigger revalidate:

```ts
// apps/web/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const { tag, token } = await req.json();
  if (token !== process.env.REVALIDATE_TOKEN) return new Response('Unauthorized', { status: 401 });
  revalidateTag(tag);
  return Response.json({ ok: true });
}
```

---

## 🌐 Environment Variables

**Root (`.env`)** — used by Drizzle CLI:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/smartbuy
```

**Web (`apps/web/.env.local`)**

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
REVALIDATE_TOKEN=supersecret
```

**Mobile (`apps/mobile/.env`)**

```
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

**API (`apps/api/.env`)**

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/smartbuy
PORT=4000
```

> Use `NEXT_PUBLIC_*` and `EXPO_PUBLIC_*` only for values safe to expose on the client.

---

## 🔁 Universal Abstractions (Web vs Native)

Abstract platform differences to keep `packages/ui` clean:

**UniversalImage**

* Web → `next/image`
* Native → `Image` from `react-native`

**UniversalLink**

* Web → `next/link`
* Native → `Linking.openURL`

Create platform files:

```
packages/ui/src/UniversalImage.web.tsx
packages/ui/src/UniversalImage.native.tsx
```

---

## 🧪 Testing & Quality

* **Lint**: ESLint + Prettier
* **Types**: TypeScript project refs
* **Unit**: Vitest + React Testing Library
* **E2E (web)**: Playwright
* **E2E (native)**: Detox (optional)

**Common scripts (root `package.json`)**

```jsonc
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:web": "turbo run dev --filter=web",
    "dev:mobile": "turbo run dev --filter=mobile",
    "dev:api": "turbo run dev --filter=api",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 🏗 Build & Deploy

### Build all apps & packages

```bash
pnpm turbo build
```

### Build specific app

```bash
pnpm turbo build --filter=web
pnpm turbo build --filter=mobile
pnpm turbo build --filter=api
```

### Web (prod)

```bash
pnpm --filter=web build
pnpm --filter=web start       # or deploy to Vercel
```

### Mobile (EAS)

```bash
# one-time
(echo "Ensure apps/mobile/eas.json is configured")
eas build:configure

# production builds
eas build -p ios --profile production
eas build -p android --profile production

# submit to stores (optional)
eas submit -p ios
eas submit -p android
```

### API (NestJS)

```bash
pnpm --filter=api build
pnpm --filter=api start:prod
```

> Configure CI/CD (GitHub Actions) to build web (Vercel) + trigger EAS + deploy API (Fly.io/ECS/Render/etc.).

---

## ⚡ Turbo Remote Caching

Speed up CI & teammate builds using Vercel Remote Cache:

```bash
pnpm turbo login
pnpm turbo link
```

---

## 🧩 Example Shared Components

**packages/ui/src/Button.tsx**

```tsx
import { Pressable, Text } from 'react-native';

type Props = { title: string; onPress?: () => void; testID?: string };
export function Button({ title, onPress, testID }: Props) {
  return (
    <Pressable onPress={onPress} testID={testID} style={{ padding: 12, borderRadius: 8 }}>
      <Text>{title}</Text>
    </Pressable>
  );
}
```

**packages/ui/src/UniversalImage.web.tsx**

```tsx
import NextImage, { ImageProps } from 'next/image';
export function UniversalImage(props: Omit<ImageProps, 'alt'> & { alt?: string }) {
  const { alt = '', ...rest } = props;
  return <NextImage alt={alt} {...rest} />;
}
```

**packages/ui/src/UniversalImage.native.tsx**

```tsx
import { Image, ImageProps } from 'react-native';
export function UniversalImage(props: ImageProps) {
  return <Image {...props} />;
}
```

---

## 🔎 Useful Links

* Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)
* Expo: [https://docs.expo.dev](https://docs.expo.dev)
* Turborepo: [https://turborepo.com/docs](https://turborepo.com/docs)
* React Native Web: [https://necolas.github.io/react-native-web/](https://necolas.github.io/react-native-web/)
* Tamagui: [https://tamagui.dev](https://tamagui.dev)  •  NativeWind: [https://www.nativewind.dev](https://www.nativewind.dev)
* Drizzle ORM: [https://orm.drizzle.team](https://orm.drizzle.team)  •  Drizzle Kit: [https://orm.drizzle.team/kit](https://orm.drizzle.team/kit)
* NestJS: [https://docs.nestjs.com](https://docs.nestjs.com)  •  PostgreSQL: [https://www.postgresql.org/docs](https://www.postgresql.org/docs)

---

💡 *SmartBuy – curated tech, smarter shopping.*
