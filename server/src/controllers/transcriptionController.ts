import { Request, Response } from "express";
import { transcribeAudio } from "../services/transcriptionService";

export async function transcribeMeetingAudio(
  req: Request,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Audio file is required",
      });
    }

    const transcript = await transcribeAudio(
      req.file.path
    );

    return res.status(200).json({
      message: "Audio transcribed successfully",
      transcript,
    });
  } catch (error) {
    console.error(
      "Transcription controller error:",
      error
    );

    return res.status(500).json({
      message: "Failed to transcribe audio",
    });
  }
}