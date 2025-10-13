import { ConfigurationError } from "../errors";

const SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send";

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new ConfigurationError(`${name} is not configured.`);
  }

  return value;
}

function resolveConfig() {
  const apiKey = assertEnv(process.env.SENDGRID_API_KEY, "SENDGRID_API_KEY");
  const from = process.env.SENDGRID_FROM_EMAIL ?? "jb@jbv.com";

  return { apiKey, from };
}

export function ensureSendGridConfigured() {
  resolveConfig();
}

export async function sendMagicLinkEmail({
  to,
  magicLink
}: {
  to: string;
  magicLink: string;
}) {
  const { apiKey, from } = resolveConfig();

  const response = await fetch(SENDGRID_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: "Your secure access link"
        }
      ],
      from: {
        email: from,
        name: "JBV Capital"
      },
      content: [
        {
          type: "text/plain",
          value: `Your secure login link: ${magicLink}\n\nThis link expires in 15 minutes and can be used once.`
        },
        {
          type: "text/html",
          value: `
            <p style="font-size:16px; line-height:1.5;">Your secure login link:</p>
            <p style="font-size:16px; line-height:1.5;">
              <a href="${magicLink}" style="color:#0ea5e9;">Access the JBV Capital portal</a>
            </p>
            <p style="font-size:14px; color:#64748b;">This link expires in 15 minutes and can be used once.</p>
          `
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("SendGrid request failed", response.status, errorText);
    throw new Error("Unable to send the magic link email.");
  }
}
