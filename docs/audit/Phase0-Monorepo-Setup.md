# Phase 0 — Monorepo Quick Start (Copy-Paste Ready)

**Goal**: Stand up a working Turborepo + pnpm monorepo skeleton in < 1 day that can host your current Vite web app + CRXJS extension with minimal breakage.

**Best 2026 reference**: https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite (clone this if you want a head start that already has web + extension + Turborepo).

---

## 1. One-Command Skeleton (Recommended for Speed)

```bash
# From your Navigator folder (or a sibling temp dir first to test)
pnpm dlx create-turbo@latest -e with-vite

# Or the even closer real-world match:
git clone https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite.git navigator-mono
cd navigator-mono
pnpm install
```

Then rename/move into your existing repo structure (or start fresh and copy your `src/` later).

---

## 2. Minimal Manual Setup (if you prefer full control)

### Root `package.json` (add these scripts)

```json
{
  "name": "navigator",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.4.0"
  },
  "packageManager": "pnpm@10.0.0",
  "engines": {
    "node": ">=20"
  }
}
```

### `pnpm-workspace.yaml` (root)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### `turbo.json` (root) — start simple

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {},
    "clean": {
      "cache": false
    }
  }
}
```

### Folder Layout (create these)

```
navigator/
├── apps/
│   ├── web/                 # your current Vite app (copy src/, package.json later)
│   └── extension/           # your current CRXJS extension
├── packages/
│   ├── ui/                  # start with your Tailwind + 3 shared components
│   ├── utils/               # pure functions only at first
│   ├── types/               # shared TS types (biggest quick win)
│   └── ai/                  # (future) home of Vercel AI SDK wrappers
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── pnpm-lock.yaml
```

---

## 3. First 2-Hour Win Commands

```bash
# 1. Install at root (this creates the single node_modules tree)
pnpm install

# 2. Move a tiny shared piece as test (example)
mkdir -p packages/types/src
cp src/types/YourImportantType.ts packages/types/src/

# 3. In packages/types/package.json (create minimal)
# {
#   "name": "@navigator/types",
#   "version": "0.0.0",
#   "private": true,
#   "exports": {
#     ".": "./src/index.ts"
#   }
# }

# 4. In your web app package.json, add:
# "dependencies": {
#   "@navigator/types": "workspace:*"
# }

# 5. Run everything
pnpm dev
```

---

## 4. Extension Gotchas & Quick Fixes (2026 reality)

- Keep the extension's own `vite.config.ts` + crxjs plugin inside `apps/extension/` for the first week (don't fight it).
- For shared Tailwind: either duplicate `tailwind.config.js` with proper content paths or use a PostCSS plugin + aliases.
- React 19 + pnpm hoisting: if you see "Invalid hook call" or duplicate React, add to root `package.json`:

```json
"pnpm": {
  "overrides": {
    "react": "19.0.0",
    "react-dom": "19.0.0"
  }
}
```

---

## 5. What NOT to Do in Phase 0

- Do **not** move the encrypted vault (`storageCore.ts`, `encryptionService.ts`, etc.)
- Do **not** change the Gemini proxy or any production AI call yet
- Do **not** delete the old Vite `package.json` / folder — keep it building until the monorepo apps are proven

---

## 6. Next After Monorepo Skeleton

See the parent [Migration-Execution-Notes.md](./Migration-Execution-Notes.md) for the Day 3–14 steps (AI SDK pilot, Next.js static export experiment, PowerSync prototype on new data only).

---

**Generated April 2026** from 2026 web research to support aggressive execution timelines. Run the commands above and report back what broke — we fix it together in the next iteration.
