import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const REGION = "ap-southeast-1";

export async function snsToHushRetreat(details, emailType) {
  const client = new SNSClient({ region: REGION });

  let message;
  let subject;

  switch (emailType) {
    case "receiveBooking":
      message = `Booking details: 
                ${details}`;
      subject = "Booking received";
      break;
    case "receivePayment":
      message = `Payment Details: 
                  ${details}`;
      subject = "Payment received";
      break;
    case "receiveNewsletter":
      message = `Subscription Details: 
                    ${details}`;
      subject = "Newsletter Subscription received";
      break;
    case "receiveFeedback":
      message = `Feedback form: 
                ${details}`;
      subject = "Feedback received";
      break;
  }

  const params = {
    Message: message,
    Subject: subject,
    TopicArn: "arn:aws:sns:ap-southeast-1:615814254462:hush-bookings",
  };
  const result = await client.send(new PublishCommand(params));
  client.destroy();
  return result;
}

export async function sesToUser(toEmail, htmlBody, subject) {
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
}