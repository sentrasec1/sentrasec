const { saveItem } = require("../shared/cosmos");
const { json, readBody, randomId } = require("../shared/http");

module.exports = async function (context, req) {
  const body = readBody(req);
  const email = body?.user?.email || body?.device?.email;
  const session = {
    id: randomId("session"),
    type: "security-session",
    email,
    user: body.user,
    device: body.device,
    detectedAt: body.detectedAt || new Date().toISOString(),
    risk: {
      hostnameVerified: false,
      agentRequired: true,
      telemetryMode: body?.device?.telemetryMode || "Browser-safe",
    },
  };

  const stored = await saveItem("securitySessions", session);
  json(context, 200, { ok: true, stored });
};
