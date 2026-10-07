import { Request, Response } from "express";
import { generateMeetingSummary } from "../services/meetingSummaryService";

export async function generateSummary(
  req: Request,
  res: Response
) {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({
        message: "Transcript is required",
      });
    }

    const result =
      await generateMeetingSummary(transcript);

    return res.status(200).json({
      message: "Meeting summary generated successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Meeting summary controller error:",
      error
    );

    return res.status(500).json({
      message: "Failed to generate meeting summary",
    });
  }
}