import type { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import app from "../../../backend/server";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    return new Promise<void>((resolve, reject) => {
      // Express handler expects (req, res, next)
      app(req, res, (err: any) => {
        if (err) {
          console.error("Express App Error:", err);
          res.status(500).json({ error: "Express App Error", details: err.message || String(err) });
          return resolve(); // resolve so Next.js doesn't hang
        }
        return resolve();
      });
    });
  } catch (error: any) {
    console.error("Failed to load backend/server:", error);
    res.status(500).json({
      error: "Failed to load backend/server",
      message: error.message,
      stack: error.stack,
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Let Express handle parsing
    externalResolver: true,
  },
};
