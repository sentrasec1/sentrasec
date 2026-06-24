const { json } = require("../shared/http");

module.exports = async function (context) {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectBase = process.env.OAUTH_REDIRECT_BASE;

  if (!clientId || !redirectBase) {
    json(context, 200, {
      ok: false,
      setupRequired: true,
      provider: "microsoft",
      message: "Set MICROSOFT_CLIENT_ID and OAUTH_REDIRECT_BASE in Azure application settings.",
    });
    return;
  }

  const redirectUri = `${redirectBase.replace(/\/$/, "")}/api/auth-microsoft`;
  const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");

  json(context, 200, { ok: true, provider: "microsoft", authUrl: authUrl.toString() });
};
