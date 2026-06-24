function json(context, status, body) {
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json",
    },
    body,
  };
}

function readBody(req) {
  return req.body || {};
}

function randomId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

module.exports = {
  json,
  readBody,
  randomId,
};
