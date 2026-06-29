import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { httpError } from "./errors.js";

export function createExportService(config) {
  const s3 = new S3Client({ region: config.awsRegion });

  return {
    async exportFlashcards(user, flashcards) {
      const generatedAt = new Date();
      const fileName = `flashcards-${user.username}-${formatTimestamp(generatedAt)}.json`;
      const body = `${JSON.stringify({
        generatedAt: generatedAt.toISOString(),
        user: {
          userId: user.userId,
          username: user.username,
          role: user.role || "user"
        },
        count: flashcards.length,
        flashcards
      }, null, 2)}\n`;

      if (config.dataStore === "dynamodb") {
        if (!config.exportBucket) {
          throw httpError(500, "EXPORT_BUCKET is required for cloud export");
        }

        const key = `${user.userId}/${fileName}`;
        await s3.send(new PutObjectCommand({
          Bucket: config.exportBucket,
          Key: key,
          Body: body,
          ContentType: "application/json"
        }));

        const downloadUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: config.exportBucket,
            Key: key
          }),
          { expiresIn: 900 }
        );

        return {
          ok: true,
          fileName,
          downloadUrl
        };
      }

      await mkdir(config.paths.exportDir, { recursive: true });
      await writeFile(path.join(config.paths.exportDir, fileName), body, "utf8");

      return {
        ok: true,
        fileName,
        downloadUrl: `/exports/${fileName}`
      };
    }
  };
}

function formatTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}
