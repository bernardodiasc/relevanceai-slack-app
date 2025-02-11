import { Manifest } from "deno-slack-sdk/mod.ts";

import { RelevanceAIOutgoingWebhookFunctionDefinition } from "./functions/relevanceai_outgoing_webhook.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "RelevanceAI-Workflow-Step",
  description: "Add RelevanceAI Outgoing Webhook step to the Slack Workflow",
  icon: "assets/default_new_app_icon.png",
  functions: [RelevanceAIOutgoingWebhookFunctionDefinition],
  workflows: [],
  outgoingDomains: ["api-f1db6c.stack.tryrelevance.com"],
  botScopes: ["commands", "chat:write", "chat:write.public"],
});
