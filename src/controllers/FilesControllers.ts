/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request } from "express";
import AWS from "aws-sdk";
import fs from "fs";

const s3 = new AWS.S3({
  accessKeyId: "AKIAW7VUGLFTOU63FWU6",
  secretAccessKey: "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",
  region: "us-east-1",
});
interface fileRequest extends Request {
  files: any;
}
const uploadFile: any = async (req: fileRequest, res: Response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const file: any = req.files.file;
  const fileData = fs.readFileSync(file.tempFilePath);

  const params = {
    Bucket: "travelcat",
    Key: file.name,
    Body: fileData,
    ContentType: file.mimetype,
    // Expires: 4000,
  };
  const data = await s3.upload(params).promise();

  res.status(200).json({
    url: data.Location,
    key: data.Key,
  });
};
export { uploadFile };
