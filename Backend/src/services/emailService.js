import dotenv from 'dotenv'

dotenv.config()

/**
 * Sends OTP email via Brevo REST API v3 using native fetch.
 */
export const sendOtpEmail = async (toEmail, otpCode) => {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_USER || 'isha242005@gmail.com'
  const senderName = process.env.BREVO_SENDER_NAME || process.env.GMAIL_SENDER_NAME || 'DevFix AI'

  if (!apiKey || !apiKey.startsWith('xkeysib-')) {
    console.error('[BREVO API ERROR] BREVO_API_KEY missing or invalid in .env (Must start with xkeysib-)')
    const configErr = new Error('Email service configuration error: Valid BREVO_API_KEY (xkeysib-...) is missing in server environment.')
    configErr.statusCode = 500
    throw configErr
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #090a0f; color: #f3f4f6; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #6366f1; margin-bottom: 8px;">DevFix AI Authentication</h2>
      <p style="font-size: 14px; color: #9ca3af; margin-bottom: 20px;">
        Use the following 6-digit One-Time Password (OTP) to log into your account. This code is valid for 5 minutes.
      </p>
      <div style="background-color: #121520; border: 1px solid #1f2434; padding: 18px; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #818cf8; text-align: center; margin: 20px 0;">
        ${otpCode}
      </div>
      <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
        If you did not request this OTP code, please ignore this email.
      </p>
    </div>
  `

  console.log(`[BREVO API DISPATCH] Sending OTP email to ${toEmail}...`)

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail }],
        subject: `${otpCode} is your DevFix AI Verification Code`,
        htmlContent: htmlContent
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`[BREVO API ERROR RESPONSE]:`, data)
      throw new Error(data.message || 'Failed to send email via Brevo API')
    }

    console.log(`[BREVO API SUCCESS] Email accepted for ${toEmail}. MessageId: ${data.messageId}`)
    return data.messageId
  } catch (sendErr) {
    console.error(`[BREVO DISPATCH ERROR]: ${sendErr.message}`)
    const error = new Error(`Failed to send OTP email: ${sendErr.message}`)
    error.statusCode = 502
    throw error
  }
}