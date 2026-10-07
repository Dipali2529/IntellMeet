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
    throw new Error("Failed to transcribe audio");
  }

  const data = await response.json();

  return data.transcript;
}