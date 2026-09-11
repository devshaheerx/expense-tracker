import { Resend } from "resend";

export const sendOTPEmail = async (toEmail, otp) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Verify your email - Expense Tracker",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Verify your email</h2>
        <p>Your one-time verification code is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};
