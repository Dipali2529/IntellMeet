
import { Request, Response } from "express";
import fs from "fs";
import { transcribeAudio } from "../services/transcriptionService";

export async function transcribeMeetingAudio(
  req: Request,
  res: Response
) {
  let filePath: string | undefined;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Audio file is required",
      });
    }

    filePath = req.file.path;

    console.log("Audio file received:", {
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
    });

    const transcript = await transcribeAudio(filePath);

    return res.status(200).json({
      message: "Audio transcribed successfully",
      transcript,
    });
  } catch (error) {
    console.error("Transcription controller error:", error);

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Unknown transcription error",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (error) => {
        if (error) {
          console.error("Failed to remove temporary audio file:", error);
        }
      });
    }
  }
}
