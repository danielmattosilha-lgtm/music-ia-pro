const apiKey = process.env.ELEVENLABS_API_KEY;
const modelId = process.env.ELEVENLABS_MODEL_ID || "music_v1";

const response = await fetch("https://api.elevenlabs.io/v1/music/stream", {
  method: "POST",
  headers: {
    "xi-api-key": apiKey,
    "Content-Type": "application/json",
    "Accept": "audio/mpeg"
  },
  body: JSON.stringify({
    prompt: "Crie uma música cantada em português do Brasil, estilo piseiro, com voz masculina clara.",
    music_length_ms: 60000,
    model_id: modelId,
    force_instrumental: false
  })
});
