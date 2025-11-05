/**
 * Resend OTP Provider for Convex Auth
 *
 * Implements email-based one-time password authentication using Resend.
 * This provider sends an 8-digit code to the user's email and verifies it.
 *
 * Environment variables required:
 * - AUTH_RESEND_KEY: Your Resend API key (https://resend.com/api-keys)
 *
 * Set via: npx convex env set AUTH_RESEND_KEY <your-key>
 *
 * @see https://labs.convex.dev/auth/config/passwords#email-verification-and-password-reset-codes
 * @see https://resend.com/docs/send-with-nodejs
 */

import { Resend } from "resend";
import { alphabet, generateRandomString } from "oslo/crypto";

// Lazy initialization - only create client when needed (after env var is set)
function getResendClient() {
  if (!process.env.AUTH_RESEND_KEY) {
    throw new Error(
      "AUTH_RESEND_KEY environment variable not set. " +
      "Set it via: npx convex env set AUTH_RESEND_KEY <your-key>"
    );
  }
  return new Resend(process.env.AUTH_RESEND_KEY);
}

export const ResendOTP = {
  id: "resend-otp",

  /**
   * Send OTP code to user's email
   */
  async sendVerificationCode(email: string, code: string) {
    const resendClient = getResendClient();
    const { data, error } = await resendClient.emails.send({
      from: "Chunked Golf <onboarding@updates.chunkedgolf.app>", // Update with your domain
      to: [email],
      subject: "Your Chunked sign-in code",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000;">Welcome to Chunked</h2>
          <p style="font-size: 16px; color: #333;">Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">
              ${code}
            </span>
          </div>
          <p style="font-size: 14px; color: #666;">
            This code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send verification code: ${error.message}`);
    }

    return data;
  },

  /**
   * Generate a random 8-digit code
   */
  generateCode(): string {
    // Generate 8-digit numeric code
    return generateRandomString(8, alphabet("0-9"));
  },

  /**
   * Verify the code (implement storage and expiry logic in your auth flow)
   */
  async verifyCode(email: string, code: string, storedCode: string, expiresAt: number): Promise<boolean> {
    if (Date.now() > expiresAt) {
      throw new Error("Verification code has expired");
    }

    if (code !== storedCode) {
      throw new Error("Invalid verification code");
    }

    return true;
  },
};

/**
 * Helper to generate and send OTP
 * Use this in your auth.config.ts signIn flow
 */
export async function sendOTP(email: string): Promise<{ code: string; expiresAt: number }> {
  const code = ResendOTP.generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  await ResendOTP.sendVerificationCode(email, code);

  return { code, expiresAt };
}
