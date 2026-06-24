const { saveItem } = require("../shared/cosmos");
const { json, readBody, randomId } = require("../shared/http");
const { sendWelcome } = require("../shared/email");

module.exports = async function (context, req) {
  const body = readBody(req);
  const event = {
    id: randomId("mail"),
    type: "welcome",
    to: body.to,
    email: body.to,
    name: body.name,
    company: body.company,
    plan: body.plan,
    trialDays: body.trialDays || 14,
    loginUrl: body.loginUrl,
  };

  const stored = await saveItem("emailEvents", event);
  const sent = await sendWelcome(event);

  json(context, 200, {
    ok: stored.ok || sent.ok,
    stored,
    sent,
  });
};
