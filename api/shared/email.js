async function sendWelcome(payload) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return { ok: false, skipped: true, reason: "SMTP is not configured" };
  }

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "SentraSec <no-reply@sentrasec.io>",
    to: payload.to,
    subject: `Welcome to SentraSec ${payload.plan || "Sentinel"}`,
    text: `Hi ${payload.name || "there"}, welcome to SentraSec. Your ${payload.plan || "Sentinel"} trial is active for ${payload.trialDays || 14} days. Login: ${payload.loginUrl || ""}`,
    html: `<p>Hi ${payload.name || "there"},</p><p>Welcome to <strong>SentraSec</strong>. Your <strong>${payload.plan || "Sentinel"}</strong> trial is active for ${payload.trialDays || 14} days.</p><p><a href="${payload.loginUrl || "#"}">Open dashboard</a></p>`,
  });

  return { ok: true };
}

module.exports = {
  sendWelcome,
};
