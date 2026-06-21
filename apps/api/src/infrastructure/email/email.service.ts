import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { IEmailService } from '../../domain/interfaces/services';
import { logger } from '../../utils/logger';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (this.isConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: env.EMAIL_PORT === 465,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      });
    }
  }

  isConfigured(): boolean {
    return Boolean(env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASS);
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${env.ADMIN_URL}/reset-password?token=${resetToken}`;

    if (!this.transporter) {
      logger.warn({ to, resetUrl }, 'Email not configured — password reset URL logged for development');
      return;
    }

    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Reset Your Password — SK Makeup Artist',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Password Reset</h1>
          <p>Dear ${userName},</p>
          <p>We received a request to reset your password. Click the link below to proceed:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #c9a962; color: #fff; text-decoration: none;">Reset Password</a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    if (!this.transporter) {
      logger.info({ to }, 'Email not configured — welcome email skipped');
      return;
    }

    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: 'Welcome to SK Makeup Artist Admin',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Welcome, ${userName}</h1>
          <p>Your admin account has been created for SK Makeup Artist.</p>
          <p>You can sign in at <a href="${env.ADMIN_URL}">${env.ADMIN_URL}</a></p>
        </div>
      `,
    });
  }
}
