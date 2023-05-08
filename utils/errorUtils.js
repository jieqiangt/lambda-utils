export class AppError extends Error {
  constructor({ title, clientMessage, status, className, message }) {
    super();
    this.title = title;
    this.clientMessage = clientMessage;
    this.status = status;
    this.className = className;
    this.message = message;
  }
}

export function catchApiWrapper(handler, allowedMethods = []) {
  return async (req, res) => {
    if (!allowedMethods.includes(req.method)) {
      res.status(405).json({
        title: "REST Method Not Allowed",
        clientMessage: `Method ${req.method} Not Allowed`,
        status: 405,
        className: "error",
        message: "",
      });
      return;
    }
    try {
      // can add in middleware for other validation
      const result = await handler(req, res);
      return result;
    } catch (err) {
      errorHandler(err, res);
    }
  };
}

export function errorHandler(err, res) {
  // for errors thrown by us
  console.log(err.Error);

  if (err.clientMessage && err.status) {
    res.status(err.status).json(err);
    return;
  }

  const {
    title = "Backend Error",
    status = 500,
    clientMessage = "Backend Error! Investigate logs in message!",
    className = "error",
    message = err,
  } = err;

  res.status(status).json({ title, clientMessage, status, className, message });
  return;
}
