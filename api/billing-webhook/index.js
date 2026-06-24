const { saveItem } = require("../shared/cosmos");
const { json, readBody, randomId } = require("../shared/http");

module.exports = async function (context, req) {
  const body = readBody(req);
  const event = {
    id: randomId("webhook"),
    type: "billing-webhook",
    providerEventId: body.id,
    email: body.email || body?.data?.object?.customer_email,
    status: body.type || "received",
    raw: body,
  };

  const stored = await saveItem("billingEvents", event);
  json(context, 200, { ok: true, stored });
};
