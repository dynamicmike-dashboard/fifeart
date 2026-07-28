const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "nancyberryuk@gmail.com";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "true";

export async function POST(request: Request) {
  try {
    const { name, email, phone, medium, size, message } = await request.json();

    if (!name || !email || !message) {
      return Response.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const subject = `FifeArt Enquiry from ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      medium ? `Medium: ${medium}` : "",
      size ? `Size: ${size}` : "",
      "",
      `Message:`,
      message,
    ].filter(Boolean).join("\n");

    if (EMAIL_ENABLED && SMTP_USER && SMTP_PASS) {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"FifeArt Website" <${SMTP_USER}>`,
        replyTo: email,
        to: CONTACT_EMAIL,
        subject,
        text: body,
      });
      return Response.json({ ok: true });
    }

    return Response.json({
      ok: true,
      note: "Email not sent (SMTP not configured). Use mailto as fallback.",
      mailto: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}