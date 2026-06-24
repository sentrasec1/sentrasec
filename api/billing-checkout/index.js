const { saveItem } = require("../shared/cosmos");
const { json, readBody, randomId } = require("../shared/http");

module.exports = async function (context, req) {
  const body = readBody(req);
  const checkout = {
    id: randomId("checkout"),
    type: "billing-checkout",
    email: body.email,
    plan: body.plan,
    status: "PENDING_PAYMENT_PROVIDER",
  };

  const stored = await saveItem("billingEvents", checkout);
  json(context, 200, {
    ok: false,
    setupRequired: true,
    checkout,
    stored,
    message: "Connect Stripe or another payment provider before taking live payments.",
  });
};
