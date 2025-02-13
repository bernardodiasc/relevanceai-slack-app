import { Manifest } from "deno-slack-sdk/mod.ts";

import { OutgoingWebhookFunctionDefinition } from "./functions/outgoing_webhook.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "Outgoing Webhook Workflow Step",
  description:
    "Add an Outgoing Webhook step to the Slack Workflow. Available to trigger Make, Zapier and RelevanceAI webhooks.",
  icon: "assets/default_new_app_icon.png",
  functions: [OutgoingWebhookFunctionDefinition],
  workflows: [],
  outgoingDomains: [
    "hook.us2.make.com",
    "hooks.zapier.com",
    "api-f1db6c.stack.tryrelevance.com",
  ],
  botScopes: ["commands", "chat:write", "chat:write.public"],
});
