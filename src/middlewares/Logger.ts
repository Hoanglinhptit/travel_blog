import { Request, Response, NextFunction } from "express";
import winston from "winston";
import nodemailer, { TransportOptions } from "nodemailer";
import { google } from "googleapis";

// google api credentals config
const CLIENT_ID =
  "1008714676265-cpf05v5rdjbqdg0sbfestn1ieh4a1f53.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =
  "1//040mRT-hn8y2PCgYIARAAGAQSNwF-L9Ir4GqHwQl_72Dvh0ZTICOgfJQJCbTpCSqBAFqIZVjuDbS95AXv7ilNFTW-n8i_X_Cc8yA";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const MY_EMAIL = "linhlh2612@gmail.com";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const ACCESS_TOKEN = async () => {
  return await oAuth2Client.getAccessToken();
};

// config logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
// Create a Nodemailer transporter for sending email notifications

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: MY_EMAIL,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: ACCESS_TOKEN(),
  },
  tls: {
    rejectUnauthorized: true,
  },
} as nodemailer.TransportOptions);

// Define an object to keep track of request and error counts
const stats: {
  requestCount: number;
  errorMessages: any[];
} = {
  requestCount: 0,
  errorMessages: [],
};

// Define an async logging middleware
const asyncLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    stats.requestCount++;

    // Log the request information asynchronously
    setImmediate(() => {
      logger.info({
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        params: req.params,
        headers: req.headers,
      });
    });

    // Continue processing the request
    next();
  } catch (error: any) {
    // Log the error
    logger.error("Error in async logging middleware:", error);

    // Add error messages to the stats object
    stats.errorMessages.push(error.message);

    // Send an email notification for the error (if desired)
    transporter.sendMail({
      from: "linhlh2612@gmail.com",
      to: "lehoanglinhptit@gmail.com",
      subject: "Error Notification",
      text: `An error occurred in your Express application: ${error.message}`,
    });

    // Pass the error to the error handling middleware
    next();
  }
};
// increateing func
const loggerMail: any = async (err: Error, next: NextFunction) => {
  // Log errors
  logger.error(err.message);

  // Send an email notification for the error
  await // Send an email notification for the error
  transporter.sendMail({
    from: "linhlh2612@gmail.com",
    to: "lehoanglinhptit@gmail.com",
    subject: "Error Notification",
    text: `An error occurred in your Express application: ${err.message}`,
  });
  next();
};

// Function to send email with request and error summary
const sendSummaryEmail = async () => {
  const { requestCount, errorMessages } = stats;
  const subject = "Request and Error Summary";
  const text = `Total Requests: ${requestCount}\nErrors:\n${errorMessages.join(
    "\n",
  )}`;

  await transporter.sendMail({
    from: "linhlh2612@gmail.com",
    to: "lehoanglinhptit@gmail.com",
    subject,
    text,
  });

  // Reset the counts and error messages after sending the email
  stats.requestCount = 0;
  stats.errorMessages = [];
};
// Send summary emails every 10 minutes
setInterval(sendSummaryEmail, 360000);

export { transporter, logger, asyncLoggerMiddleware, loggerMail };
