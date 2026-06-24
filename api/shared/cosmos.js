const { CosmosClient } = require("@azure/cosmos");

const databaseId = process.env.COSMOS_DATABASE || "sentrasec";
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;

let client;
let database;

function getClient() {
  if (!endpoint || !key) return null;
  if (!client) client = new CosmosClient({ endpoint, key });
  return client;
}

async function getDatabase() {
  if (database) return database;
  const cosmos = getClient();
  if (!cosmos) return null;
  const result = await cosmos.databases.createIfNotExists({ id: databaseId });
  database = result.database;
  return database;
}

async function getContainer(containerId, partitionKey = "/tenantId") {
  const db = await getDatabase();
  if (!db) return null;
  const result = await db.containers.createIfNotExists({
    id: containerId,
    partitionKey,
  });
  return result.container;
}

function tenantFromEmail(email) {
  if (!email || !email.includes("@")) return "demo";
  return email.split("@")[1].toLowerCase();
}

async function saveItem(containerId, item, partitionKey = "/tenantId") {
  const container = await getContainer(containerId, partitionKey);
  const now = new Date().toISOString();
  const document = {
    tenantId: item.tenantId || tenantFromEmail(item.email || item.to || item?.user?.email),
    createdAt: item.createdAt || now,
    updatedAt: now,
    ...item,
  };

  if (!container) {
    return { ok: false, demo: true, item: document };
  }

  const result = await container.items.create(document);
  return { ok: true, item: result.resource };
}

module.exports = {
  saveItem,
  tenantFromEmail,
};
