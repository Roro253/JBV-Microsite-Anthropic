import { IntegrationError } from "../errors";
import { retry } from "../utils/retry";

const SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send";

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new IntegrationError("sendgrid", `${name} is not configured.`);
  }

  return value;
}

export async function sendMagicLinkEmail({
  to,
  magicLink
}: {
  to: string;
  magicLink: string;
}) {
  const apiKey = assertEnv(process.env.SENDGRID_API_KEY, "SENDGRID_API_KEY");
  const from = process.env.SENDGRID_FROM_EMAIL ?? "jb@jbv.com";

  try {
    const response = await retry(async () => {
      try {
        const result = await fetch(SENDGRID_ENDPOINT, {
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

        if (result.status >= 500 || result.status === 429) {
          const errorText = await result.text().catch(() => "");
          console.error("SendGrid transient error", result.status, errorText);
          throw new IntegrationError("sendgrid", "SendGrid temporarily unavailable.", {
            cause: new Error(`Status ${result.status}`)
          });
        }

        return result;
      } catch (error) {
        throw new IntegrationError("sendgrid", "Unable to reach SendGrid.", {
          cause: error
        });
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("SendGrid request failed", response.status, errorText);
      throw new IntegrationError("sendgrid", "Unable to send the magic link email.", {
        cause: new Error(`Status ${response.status}`)
      });
    }
  } catch (error) {
    if (error instanceof IntegrationError) {
      throw error;
    }

    throw new IntegrationError("sendgrid", "Unable to send the magic link email.", {
      cause: error
    });
  }
}
