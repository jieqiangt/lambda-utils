import { snsToHushRetreat, sesToUser } from "./utils/awsUtils.js";
import { connectClient, updateOneFromCollection } from "./utils/mongoUtils.js";

export const handler = async (event) => {
  const { awsService } = event;

  // if (awsService == "sns") {
  //   const { message, emailType } = event;
  //   const snsResult = snsToHushRetreat(message, emailType);

  //   console.log({ snsResult });
  // }

  if (awsService == "ses") {
    const { htmlBody, email, subject, idToUpdate, status, collection } = event;
    const sesResult = await sesToUser(email, htmlBody, subject);

    console.log({ sesResult });
    if (sesResult.ok) {
      const client = await connectClient();
      const filter = { _id: idToUpdate };
      const update = { status: status };

      const updateResult = await updateOneFromCollection(
        client,
        process.env.MONGO_DBNAME,
        collection,
        filter,
        update
      );
      console.log({ updateResult });

      if (!(updateResult.modifiedCount === "1")) {
        //send to logs that modification failed. Not related to user.
      }
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("ran code"),
  };

  return response;
};

const event = {
  htmlBody: "<h1>This is a test email</h1>",
  email: "jieqiangt@gmail.com",
  subject: "test email",
  idToUpdate: "",
  status: "ConfirmationSent",
  collection: "feedback",
  awsService: "ses",
};

const response = await handler(event);
console.log({ response });
