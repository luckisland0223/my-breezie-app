import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
export const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendVerificationCodeEmail(to: string, code: string) {
  if (!resend) throw new Error('RESEND_API_KEY is not configured')
  
  const fromAddress = process.env.RESEND_FROM || 'Breezie <info@breezie.io>'
  const recipient = process.env.RESEND_TO_OVERRIDE || to
  const subject = `Breezie Verification Code: ${code}`
  
  // Enhanced logging
  console.log('📧 Sending verification email:')
  console.log('  From:', fromAddress)
  console.log('  To:', recipient)
  console.log('  Original recipient:', to)
  console.log('  Override active:', !!process.env.RESEND_TO_OVERRIDE)
  console.log('  Subject:', subject)
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#f7f7f8; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #eee; border-radius:12px; overflow:hidden;">
      <div style="padding:20px 24px; border-bottom:1px solid #f0f0f0;">
        <h1 style="margin:0; font-size:18px;">Breezie</h1>
      </div>
      <div style="padding:24px; color:#111827;">
        <p style="margin:0 0 12px;">Hi,</p>
        <p style="margin:0 0 16px;">Use the following verification code to continue your sign up:</p>
        <div style="font-size:28px; letter-spacing:6px; font-weight:700; text-align:center; padding:16px 0;">${code}</div>
        <p style="margin:12px 0 0; color:#6b7280; font-size:14px;">This code expires in 15 minutes. If you didn’t request this, you can safely ignore this email.</p>
      </div>
      <div style="padding:16px 24px; background:#fafafa; border-top:1px solid #f0f0f0; color:#6b7280; font-size:12px;">
        Sent by Breezie • info@breezie.io
      </div>
    </div>
  </div>`
  const text = `Your Breezie verification code is ${code}. It expires in 15 minutes.`

  try {
    const result = await resend.emails.send({ from: fromAddress, to: recipient, subject, html, text })
    console.log('✅ Email sent successfully:', result.data?.id)
    return result
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    throw error
  }
}

// Simple helper to send a hello email (requested snippet)
export async function sendHelloEmail() {
  if (!resend) throw new Error('RESEND_API_KEY is not configured')
  return resend.emails.send({
    from: process.env.RESEND_FROM || 'Breezie <info@breezie.io>',
    to: process.env.RESEND_TO_OVERRIDE || 'info@breezie.io',
    subject: 'Breezie: Hello World',
    html: '<p>Congrats from <strong>Breezie</strong> — your email setup works!</p>',
    text: 'Congrats from Breezie — your email setup works!'
  })
}

