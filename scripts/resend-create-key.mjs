// Node script to create a Resend API key without hardcoding secrets
// Usage:
//   RESEND_API_KEY=your_admin_key node scripts/resend-create-key.mjs "Production"
// or set RESEND_NEW_KEY_NAME env var.

import { Resend } from 'resend'

const adminKey = process.env.RESEND_API_KEY
if (!adminKey) {
  console.error('Missing RESEND_API_KEY environment variable.')
  process.exit(1)
}

const name = process.argv[2] || process.env.RESEND_NEW_KEY_NAME || 'Production'

async function main() {
  const resend = new Resend(adminKey)
  try {
    const created = await resend.apiKeys.create({ name })
    // Note: The secret will only be shown once in Resend dashboard/API response.
    console.log('Created Resend API key:', created)
    console.log('\nIMPORTANT: Save the secret now and add to your env as RESEND_API_KEY.\n')
  } catch (e) {
    console.error('Failed to create key:', e?.message || e)
    process.exit(1)
  }
}

main()

