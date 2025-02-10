import { Manifest } from "deno-slack-sdk/mod.ts";

import { OutgoingWebhookFunctionDefinition } from "./functions/outgoing_webhook.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "RelevanceAI-Slack-app",
  description: "A blank template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  functions: [OutgoingWebhookFunctionDefinition],
  workflows: [],
  outgoingDomains: ["api-f1db6c.stack.tryrelevance.com"],
  botScopes: ["commands", "chat:write", "chat:write.public"],
});
