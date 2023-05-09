import { sesToUser } from "./utils/awsUtils.js";
import { ApiError } from "./utils/errorUtils.js";
import { connectClient, updateOneFromCollection } from "./utils/mongoUtils.js";
import dotenv from "dotenv";
dotenv.config();

export const handler = async (event) => {
  const { htmlBody, email, subject, idToUpdate, status, collection } = event;

  await sesToUser(email, htmlBody, subject);

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

  if (!updateResult.acknowledged | !(updateResult.modifiedCount === "1")) {
    throw new ApiError({
      title: "Mongo Update Error",
      status: 503,
      message:
        "Email sent via AWS SES but MongoDB update failed with no acknowledgement & modified count is 0",
    });
  }

  return { statusCode: 200, body: "Email sent via AWS SES & MongoDB Updated!" };
};
