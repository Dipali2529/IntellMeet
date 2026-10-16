
export async function transcribeAudio(
  audioBlob: Blob
): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "meeting-audio.webm");

  const response = await fetch(
    "http://localhost:5000/api/transcription/transcribe",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Transcription API error:", {
      status: response.status,
      details: errorText,
    });

    throw new Error(
      `Transcription failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  if (typeof data.transcript !== "string") {
    throw new Error(
      "The server response does not contain a transcript."
    );
  }

  return data.transcript;
}
