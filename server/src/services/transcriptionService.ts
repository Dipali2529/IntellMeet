import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MOCK_TRANSCRIPTION =
  process.env.AI_TRANSCRIPTION_MOCK === "true";

export async function transcribeAudio(
  filePath: string
): Promise<string> {
  try {
      if (MOCK_TRANSCRIPTION) {
        console.log(
          "[Transcription] Mock mode enabled - skipping OpenAI API"
        );

        return "This is a development mock transcript for the IntellMeet meeting. The real AI transcription service will process the meeting audio when OpenAI API credits are available.";
      }


    const audioFile = fs.createReadStream(filePath);

    const transcription =
      await openai.audio.transcriptions.create({
        file: audioFile,
       // model: "whisper-1",
        model: "gpt-4o-mini-transcribe",
      });

    return transcription.text;
  } catch (error) {
    console.error(
      "Transcription service error:",
      error
    );

    throw new Error(
      "Unable to transcribe audio"
    );
  }
}