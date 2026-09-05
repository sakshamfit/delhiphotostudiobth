#!/usr/bin/env node
/**
 * Installs the curated OriginKit components listed in originkit.components.json
 * using the OriginKit CLI and the ORIGINKIT_API_KEY from the environment
 * (or .env.local). Run: `npm run originkit:add`
 *
 * Requires network access to originkit.dev. In restricted/sandboxed
 * environments where that host is blocked, run this on your own machine or CI.
 */
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Load ORIGINKIT_API_KEY from env or .env.local
function loadKey() {
  if (process.env.ORIGINKIT_API_KEY) return process.env.ORIGINKIT_API_KEY.trim()
  const envPath = join(root, '.env.local')
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, 'utf8')
      .split('\n')
      .find((l) => l.trim().startsWith('ORIGINKIT_API_KEY='))
    if (line) return line.split('=').slice(1).join('=').trim()
  }
  return ''
}

const key = loadKey()
if (!key) {
  console.error('✕ ORIGINKIT_API_KEY not found. Add it to .env.local or export it.')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(join(root, 'originkit.components.json'), 'utf8'))
const names = manifest.components.map((c) => c.name)

console.log(`› Installing ${names.length} OriginKit components:\n  ${names.join(', ')}\n`)

try {
  execSync(`npx -y originkit@latest add ${names.join(' ')} --auth "${key}" --overwrite`, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ORIGINKIT_API_KEY: key },
  })
  console.log('\n✓ OriginKit components installed into src/components/originkit/')
} catch (err) {
  console.error('\n✕ OriginKit install failed.')
  console.error('  If the error is ECONNRESET / "Couldn\'t reach the registry", this')
  console.error('  environment blocks originkit.dev. Run this script where the host is')
  console.error('  reachable (your machine / CI) — the key and manifest are already set.')
  process.exit(1)
}
