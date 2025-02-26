import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import OutgoingWebhookSlackFunction from "./outgoing_webhook.ts";
import { OutgoingWebhookFunction } from "./outgoing_webhook.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";

const WEBHOOK_URL_MAKE = "https://hook.us2.make.com/";
const WEBHOOK_URL_RELEVANCE = "https://api-f1db6c.stack.tryrelevance.com/";
const WEBHOOK_URL_ZAPIER = "https://hooks.zapier.com/";

const { createContext } = SlackFunctionTester("outgoing_webhook");

const defaultInputs = {
  message: "Hello, World!",
  threadId: {
    "channel_id": "QWEASD",
    "message_ts": "123456",
  },
  uniqueId: "ASDZXC",
};

Deno.test("Outgoing Webhook Slack Function test", async () => {
  const mockFetch = new MockFetch();
  mockFetch
    .intercept(WEBHOOK_URL_MAKE, { method: "POST" })
    .response("hello", { status: 200 })
    .persist();
  const inputs = {
    webhook: WEBHOOK_URL_MAKE,
    ...defaultInputs,
  };
  const { outputs, error } = await OutgoingWebhookSlackFunction(
    createContext({ inputs }),
  );
  assertEquals(error, undefined);
  assertEquals(outputs, { response: "hello" });
});

Deno.test("Outgoing Webhook method test using Make", async () => {
  const mockFetch = new MockFetch();
  mockFetch
    .intercept(WEBHOOK_URL_MAKE, { method: "POST" })
    .response("hello", { status: 200 })
    .persist();
  const inputs = {
    webhook: WEBHOOK_URL_MAKE,
    ...defaultInputs,
  };
  const output = await OutgoingWebhookFunction(inputs);
  assertEquals(output, { outputs: { response: "hello" } });
});

Deno.test("Outgoing Webhook method test using Relevance", async () => {
  const mockFetch = new MockFetch();
  mockFetch
    .intercept(WEBHOOK_URL_RELEVANCE, { method: "POST" })
    .response('{ "message": "hello" }', { status: 200 })
    .persist();
  const inputs = {
    webhook: WEBHOOK_URL_RELEVANCE,
    ...defaultInputs,
  };
  const output = await OutgoingWebhookFunction(inputs);
  assertEquals(output, { outputs: { response: "hello" } });
});

Deno.test("Outgoing Webhook method test using Zapier", async () => {
  const mockFetch = new MockFetch();
  mockFetch
    .intercept(WEBHOOK_URL_ZAPIER, { method: "POST" })
    .response("hello", { status: 200 })
    .persist();
  const inputs = {
    webhook: WEBHOOK_URL_ZAPIER,
    ...defaultInputs,
  };
  const output = await OutgoingWebhookFunction(inputs);
  assertEquals(output, { outputs: { response: "hello" } });
});
