import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { ApiError } from "./errorUtils.js";

const REGION = "ap-southeast-1";

export async function sesToUser(toEmail, htmlBody, subject) {
  try {
    const client = new SESClient({ region: REGION });
    const verifiedEmail = "hello@thehushretreats.com";

    const result = await client.send(
      new SendEmailCommand({
        Source: verifiedEmail,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Body: {
            Html: {
              charset: "UTF-8",
              Data: htmlBody,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: subject,
          },
        },
        replyToAddresses: [verifiedEmail],
      })
    );
    client.destroy();
    return result;
  } catch (err) {
    throw new ApiError({
      title: "AWS SES Error",
      status: 503,
      message: err,
    });
  }
}
