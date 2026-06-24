const { json } = require("../shared/http");

module.exports = async function (context) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectBase = process.env.OAUTH_REDIRECT_BASE;

  if (!clientId || !redirectBase) {
    json(context, 200, {
      ok: false,
      setupRequired: true,
      provider: "google",
      message: "Set GOOGLE_CLIENT_ID and OAUTH_REDIRECT_BASE in Azure application settings.",
    });
    return;
  }

  const redirectUri = `${redirectBase.replace(/\/$/, "")}/api/auth-google`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("prompt", "select_account");

  json(context, 200, { ok: true, provider: "google", authUrl: authUrl.toString() });
};
