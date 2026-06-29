const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function sendWelcomeEmail(name, email) {
  try {
    await transporter.sendMail({
      from:    `"FinFlow 🌸" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Welcome to FinFlow, ${name}! 🌸`,
      html: `
        <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0015; color: #ffe8f5; padding: 40px; border-radius: 16px;">
          <h1 style="font-family: Georgia, serif; color: #ff2d8f; font-size: 32px; margin-bottom: 8px;">FinFlow 🌸</h1>
          <p style="color: #c084a0; margin-bottom: 32px;">Your Personal Finance Dashboard</p>
          <h2 style="font-size: 24px; margin-bottom: 16px;">Welcome, ${name}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #ffe8f5; margin-bottom: 24px;">Your account has been created successfully! You can now:</p>
          <ul style="font-size: 15px; line-height: 2; color: #ff85c2; margin-bottom: 32px;">
            <li>📊 Track your income and expenses</li>
            <li>💰 Set and monitor budgets</li>
            <li>🎯 Create financial goals</li>
            <li>🤖 Get AI-powered financial advice</li>
          </ul>
          <a href="${process.env.CLIENT_URL}/dashboard" style="background: #ff2d8f; color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 500;">Go to Dashboard →</a>
          <p style="margin-top: 32px; font-size: 13px; color: #c084a0;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    })
    console.log(`✅ Welcome email sent to ${email}`)
  } catch (err) {
    console.error('❌ Email error:', err.message)
  }
}

async function sendBudgetAlertEmail(name, email, category, spent, limit) {
  try {
    await transporter.sendMail({
      from:    `"FinFlow 🌸" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `⚠️ Budget Alert — ${category} is over budget!`,
      html: `
        <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0015; color: #ffe8f5; padding: 40px; border-radius: 16px;">
          <h1 style="font-family: Georgia, serif; color: #ff2d8f; font-size: 32px; margin-bottom: 8px;">FinFlow 🌸</h1>
          <p style="color: #c084a0; margin-bottom: 32px;">Budget Alert</p>
          <h2 style="font-size: 24px; margin-bottom: 16px;">Hi ${name}, you're over budget! ⚠️</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #ffe8f5; margin-bottom: 24px;">Your <strong style="color: #ff2d8f;">${category}</strong> spending has exceeded your budget limit.</p>
          <div style="background: #1a0028; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; color: #c084a0; font-size: 13px;">SPENT</p>
            <p style="margin: 0; font-size: 28px; color: #ff1744;">₹${spent.toLocaleString('en-IN')}</p>
            <p style="margin: 8px 0 0; color: #c084a0; font-size: 13px;">Budget limit: ₹${limit.toLocaleString('en-IN')}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/budget" style="background: #ff2d8f; color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 500;">View Budget →</a>
        </div>
      `,
    })
    console.log(`✅ Budget alert sent to ${email}`)
  } catch (err) {
    console.error('❌ Email error:', err.message)
  }
}

async function sendPasswordResetEmail(name, email, resetToken) {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    await transporter.sendMail({
      from:    `"FinFlow 🌸" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Reset your FinFlow password 🔐`,
      html: `
        <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0015; color: #ffe8f5; padding: 40px; border-radius: 16px;">
          <h1 style="font-family: Georgia, serif; color: #ff2d8f; font-size: 32px; margin-bottom: 8px;">FinFlow 🌸</h1>
          <p style="color: #c084a0; margin-bottom: 32px;">Password Reset</p>
          <h2 style="font-size: 24px; margin-bottom: 16px;">Hi ${name}, reset your password</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #ffe8f5; margin-bottom: 24px;">
            You requested a password reset. Click the button below. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="background: #ff2d8f; color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 500;">Reset Password →</a>
          <p style="margin-top: 32px; font-size: 13px; color: #c084a0;">If you didn't request this, ignore this email.</p>
          <p style="font-size: 11px; color: #8b6070; margin-top: 8px;">Link expires in 1 hour.</p>
        </div>
      `,
    })
    console.log(`✅ Password reset email sent to ${email}`)
  } catch (err) {
    console.error('❌ Email error:', err.message)
  }
}

async function sendAccountDeletionEmail(name, email) {
  try {
    await transporter.sendMail({
      from:    `"FinFlow 🌸" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Your FinFlow account has been deleted`,
      html: `
        <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0015; color: #ffe8f5; padding: 40px; border-radius: 16px;">
          <h1 style="font-family: Georgia, serif; color: #ff2d8f; font-size: 32px; margin-bottom: 8px;">FinFlow 🌸</h1>
          <p style="color: #c084a0; margin-bottom: 32px;">Account Deleted</p>
          <h2 style="font-size: 24px; margin-bottom: 16px;">Goodbye, ${name} 👋</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #ffe8f5; margin-bottom: 24px;">
            Your FinFlow account and all associated data has been permanently deleted.
          </p>
          <ul style="font-size: 15px; line-height: 2; color: #ff85c2; margin-bottom: 32px;">
            <li>✅ All transactions deleted</li>
            <li>✅ All budgets deleted</li>
            <li>✅ All goals deleted</li>
            <li>✅ Account removed</li>
          </ul>
          <p style="font-size: 14px; color: #c084a0;">If you didn't request this, please contact us immediately.</p>
          <p style="margin-top: 32px; font-size: 13px; color: #8b6070;">This is an automated email from FinFlow.</p>
        </div>
      `,
    })
    console.log(`✅ Deletion email sent to ${email}`)
  } catch (err) {
    console.error('❌ Email error:', err.message)
  }
}

module.exports = { sendWelcomeEmail, sendBudgetAlertEmail, sendPasswordResetEmail, sendAccountDeletionEmail }