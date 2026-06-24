const { saveItem } = require("../shared/cosmos");
const { json, readBody, randomId } = require("../shared/http");

module.exports = async function (context, req) {
  const body = readBody(req);
  const request = {
    id: randomId("agent"),
    type: "agent-install-request",
    email: body.email,
    platform: body.platform,
    plan: body.plan,
    status: "REQUESTED",
    downloadUrl: "/downloads/sentrasec-agent-placeholder",
  };

  const stored = await saveItem("agentRequests", request);
  json(context, 200, { ok: true, request, stored });
};
