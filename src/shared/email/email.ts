import nodemailer from "nodemailer";
import { headers } from "next/headers";

export async function getAppOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function sendMail(input: { to: string; subject: string; text: string }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;
  if (!host || !user || !pass || !from) return { sent: false };

  try {
    const port = Number(process.env.SMTP_PORT ?? "587");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: { name: "Secret Santa", address: from },
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { sent: true };
  } catch {
    return { sent: false };
  }
}
