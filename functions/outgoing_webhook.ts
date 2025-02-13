// deno-lint-ignore-file no-explicit-any

import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const OutgoingWebhookFunctionDefinition = DefineFunction({
  callback_id: "outgoing_webhook",
  title: "Outgoing Webhook",
  description: "Add an Outgoing Webhook step to the Slack Workflow",
  source_file: "functions/outgoing_webhook.ts",
  input_parameters: {
    properties: {
      webhook: {
        type: Schema.types.string,
        description: "The url of the webhook you want to trigger",
      },
      message: {
        type: Schema.slack.types.rich_text,
        description: "The content payload to be sent with the webhook",
      },
    },
    required: [
      "webhook",
      "message",
    ],
  },
  output_parameters: {
    properties: {
      response: {
        type: Schema.types.string,
        description: "The agent response",
      },
    },
    required: ["response"],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  OutgoingWebhookFunctionDefinition,
  async ({ inputs }) => {
    const { webhook, message } = inputs;
    const config = {
      method: "POST",
      headers: new Headers({
        "content-type": "application/json",
        "body-type": "raw",
      }),
      body: JSON.stringify({
        message: richTextBlockToMrkdwn(message[0]),
      }),
    };
    try {
      const fetcher = await fetch(webhook, config);
      if (!fetcher.ok) {
        throw new Error(`HTTP error! status: ${fetcher.status}`);
      }
      const response = await fetcher.text();
      let message;
      try {
        const { parsedResponse } = JSON.parse(response);
        message = parsedResponse.message;
      } catch {
        message = response;
      }
      return { outputs: { response: message } };
    } catch (error) {
      console.error("Error sending webhook:", error);
      throw error;
    }
  },
);

/**
 * Convet RichText to MarkDown
 */

type RichTextElement = /*unresolved*/ any;
type RichTextSection = /*unresolved*/ any;
type RichTextList = /*unresolved*/ any;
type RichTextBlockElement = /*unresolved*/ any;
type RichTextBlock = /*unresolved*/ any;

export const quoteMrkdwn = (text: string): string => {
  return ("> " + text).split("\n").join("\n> ");
};

const applyMrkdwnStyle = (
  text: string,
  style: RichTextElement["style"],
): string => {
  if (!style || text.startsWith(" ") || text.endsWith(" ")) return text;
  if (style.code) text = `\`${text}\``;
  if (style.strike) text = `~${text}~`;
  if (style.italic) text = `_${text}_`;
  if (style.bold) text = `**${text}**`;
  return text;
};

// Conversion from these docs: https://api.slack.com/reference/surfaces/formatting#advanced
const richTextElementToMrkdwn = (element: RichTextElement): string => {
  switch (element.type) {
    case "broadcast":
      return applyMrkdwnStyle(`<!${element.range}>`, element.style);
    case "channel":
      return applyMrkdwnStyle(`<#${element.channel_id}>`, element.style);
    case "color":
      return applyMrkdwnStyle(element.value, element.style);
    case "date": {
      let dateText = `<!date^${element.timestamp}^${element.format}`;
      if (element.url) dateText += `^${element.url}`;
      if (element.fallback) dateText += `|${element.fallback}`;
      dateText += ">";
      return applyMrkdwnStyle(dateText, element.style);
    }
    case "emoji":
      return `:${element.name}:`;
    case "link": {
      const formattedText = element.text
        ? `<${element.url}|${element.text}>`
        : element.url;
      return applyMrkdwnStyle(formattedText, element.style);
    }
    case "team": // There is no documented way to display this nicely in mrkdwn
      return applyMrkdwnStyle(element.team_id, element.style);
    case "text":
      return applyMrkdwnStyle(element.text, element.style);
    case "user":
      return applyMrkdwnStyle(`<@${element.user_id}>`, element.style);
    case "usergroup":
      return applyMrkdwnStyle(
        `<!subteam^${element.usergroup_id}>`,
        element.style,
      );
    default:
      return "";
  }
};

const richTextSectionToMrkdwn = (section: RichTextSection): string => {
  return section.elements.map(richTextElementToMrkdwn).join("");
};

const richTextListToMrkdwn = (element: RichTextList): string => {
  let mrkdwn = "";
  for (const section of element.elements) {
    mrkdwn += `${"    ".repeat(element.indent ?? 0)} • ${
      richTextSectionToMrkdwn(section)
    }\n`;
  }
  return mrkdwn;
};

const richTextBlockElementToMrkdwn = (
  element: RichTextBlockElement,
): string => {
  switch (element.type) {
    case "rich_text_list":
      return richTextListToMrkdwn(element);
    case "rich_text_preformatted":
      return "```" + element.elements.map(richTextElementToMrkdwn).join("") +
        "```";
    case "rich_text_quote":
      return quoteMrkdwn(
        element.elements.map(richTextElementToMrkdwn).join(""),
      );
    case "rich_text_section":
      return element.elements.map(richTextElementToMrkdwn).join("");
    default:
      return "";
  }
};

// Slack doesn't provide tools out of the box for converting a rich text block to mrkdwn
// See this issue: https://github.com/slackapi/bolt-js/issues/2087
const richTextBlockToMrkdwn = (richTextBlock: RichTextBlock) => {
  const mrkdwn = richTextBlock.elements.map(richTextBlockElementToMrkdwn).join(
    "",
  );
  return mrkdwn;
};
