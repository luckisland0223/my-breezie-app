import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
export const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendVerificationCodeEmail(to: string, code: string) {
  if (!resend) throw new Error('RESEND_API_KEY is not configured')
  const from = process.env.RESEND_FROM || 'onboarding@resend.dev'
  return resend.emails.send({
    from,
    to: process.env.RESEND_TO_OVERRIDE || to,
    subject: 'Your Breezie verification code',
    html: `<p>Your verification code is <strong>${code}</strong>. It expires in 15 minutes.</p>`,
  })
}

// Simple helper to send a hello email (requested snippet)
export async function sendHelloEmail() {
  if (!resend) throw new Error('RESEND_API_KEY is not configured')
  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'info@breezie.io',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
  })
}

