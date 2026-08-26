import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { prepareSpaHtml } from "./spa-html";
import { storage } from "./storage";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  async function sendSpaIndex(req: express.Request, res: express.Response) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const indexPath = path.resolve(distPath, "index.html");
    const html = await fs.promises.readFile(indexPath, "utf-8");
    const enriched = await prepareSpaHtml(html, req.originalUrl, storage);
    res.status(200).set({ "Content-Type": "text/html" }).send(enriched);
  }

  app.get("/", sendSpaIndex);

  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), {
      maxAge: "1y",
      immutable: true,
    }),
  );

  app.use(
    express.static(distPath, {
      index: false,
      maxAge: "7d",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    }),
  );

  app.use("/{*path}", sendSpaIndex);
}
