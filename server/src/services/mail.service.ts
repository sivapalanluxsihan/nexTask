import nodemailer from 'nodemailer';

import { getOnboardingTemplate } from '../templates/onboarding';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: { user, pass },
      });
    }
  }

  public async sendOnboardingEmail(
    to: string,
    name: string | null,
    tempPassword: string,
  ): Promise<void> {
    const displayName = name || 'Team Member';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!this.transporter) {
      console.log(`[MAIL_WARN] SMTP not configured. Onboarding email for ${to} printed below:`);
      console.log(` -> Temp Password: ${tempPassword}`);
      return;
    }

    const htmlContent = getOnboardingTemplate({
      email: to,
      name: displayName,
      tempPassword,
      clientUrl,
    });

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"nexTask" <no-reply@nextask.com>',
      to,
      subject: 'Welcome to nexTask - Set Up Your Account',
      html: htmlContent,
    });
  }


  public async sendTaskAssignmentEmail(
    to: string,
    name: string,
    taskTitle: string,
    projectName: string
  ): Promise<void> {
    if (!this.transporter) {
      console.log(`[MAIL_WARN] SMTP not configured. Task Assignment email for ${to} printed below:`);
      console.log(` -> Assigned to Task: ${taskTitle}`);
      return;
    }

    // We will build a fancy HTML template for this in the next step!
    const htmlContent = `
      <h3>Hello ${name},</h3>
      <p>You have been assigned to a new task: <strong>${taskTitle}</strong></p>
      <p>Project: ${projectName}</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Log in to view your task</a>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM || '"nexTask" <no-reply@nextask.com>',
      to,
      subject: `New Task Assigned: ${taskTitle}`,
      html: htmlContent,
    });
  }
}
