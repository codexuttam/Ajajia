import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,   // your Gmail address
    pass: process.env.SMTP_PASS,   // your Gmail App Password
  },
});

export async function POST(req: NextRequest) {
  try {
    const { toEmail, docTitle, docId, sharedByUserId } = await req.json();

    if (!toEmail || !docId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ error: 'SMTP not configured. Add SMTP_USER and SMTP_PASS to .env.local' }, { status: 500 });
    }

    const docUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/doc/${docId}`;

    await transporter.sendMail({
      from: `"Ajaia Docs" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `${sharedByUserId || 'Someone'} shared "${docTitle || 'a document'}" with you`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:40px 20px;">
          <div style="background:white;border-radius:16px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
            <div style="display:flex;align-items:center;margin-bottom:32px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#4f46e5,#0ea5e9);border-radius:10px;margin-right:12px;"></div>
              <span style="font-size:22px;font-weight:700;color:#0f172a;">Ajaia Docs</span>
            </div>
            <h1 style="font-size:24px;color:#0f172a;margin:0 0 12px 0;">A document has been shared with you</h1>
            <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 8px 0;">
              <strong style="color:#0f172a;">${sharedByUserId || 'A user'}</strong> shared
              <strong style="color:#4f46e5;">"${docTitle || 'Untitled Document'}"</strong> with you.
            </p>
            <p style="color:#64748b;font-size:15px;margin:0 0 32px 0;">Click below to open and start collaborating.</p>
            <a href="${docUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#0ea5e9);color:white;text-decoration:none;padding:14px 32px;border-radius:9999px;font-weight:600;font-size:15px;">
              Open Document →
            </a>
            <p style="margin-top:32px;font-size:13px;color:#94a3b8;">
              Or copy: <a href="${docUrl}" style="color:#4f46e5;">${docUrl}</a>
            </p>
          </div>
          <p style="text-align:center;margin-top:24px;font-size:12px;color:#94a3b8;">
            Sent via Ajaia Docs
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Email send error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
