const test = require("node:test");
const assert = require("node:assert/strict");
const handler = require("../api/essay-review.js");

function makeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function request(body, ip) {
  const res = makeResponse();
  await handler(
    {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      socket: { remoteAddress: ip },
      body,
    },
    res,
  );
  return res;
}

test("malformed null chat messages return a controlled 400 response", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "unit-test-key";
  try {
    const res = await request(
      { action: "chat", answer: "Contoh jawaban esai.", messages: [null] },
      "essay-test-null-message",
    );
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, "INVALID_MESSAGES");
    assert.equal(res.headers["cache-control"], "no-store");
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test("chat messages must have an allowed role and string text", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "unit-test-key";
  try {
    const res = await request(
      { action: "chat", answer: "Contoh jawaban esai.", messages: [{ role: "user" }] },
      "essay-test-missing-text",
    );
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, "INVALID_MESSAGES");
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test("a non-array messages payload is rejected before contacting the provider", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "unit-test-key";
  try {
    const res = await request(
      { action: "chat", answer: "Contoh jawaban esai.", messages: { role: "user", text: "Hai" } },
      "essay-test-non-array",
    );
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, "INVALID_MESSAGES");
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});
