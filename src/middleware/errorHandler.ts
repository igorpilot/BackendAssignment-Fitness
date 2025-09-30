import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

interface CustomError extends Error {
  statusCode?: number;
  contextMessage?: string;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const contextMessage = err.contextMessage ? `[${err.contextMessage}] ` : "";
  const logMessage = `[${new Date().toISOString()}] ${contextMessage}${
    err.stack || err
  }\n`;

  console.error(logMessage); // Logging to console

  // Logging to file
  const logDir = path.join(__dirname, "../../logs");
  const logPath = path.join(logDir, "error.log");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.appendFile(logPath, logMessage, (fsErr) => {
    if (fsErr) console.error("Failed to write error log:", fsErr);
  });

  // 3. Send generic error response
  res
    .status(err.statusCode && err.statusCode >= 400 ? err.statusCode : 500)
    .json({
      data: {},
      message: "Something went wrong",
    });
};
