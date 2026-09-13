import { Resend } from 'resend';

export const sendOTPEmail = async (toEmail, otp, purpose = 'verify') => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const isReset = purpose === 'reset';

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: isReset ? 'Reset your password - Expense Tracker' : 'Verify your email - Expense Tracker',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>${isReset ? 'Reset your password' : 'Verify your email'}</h2>
        <p>Your ${isReset ? 'password reset' : 'verification'} code is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};