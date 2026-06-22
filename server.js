const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const generatedDir = path.join(__dirname, "generated");

if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir);

app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use("/generated", express.static(generatedDir));

function baseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function criarLetra(title, theme, style) {
  return `[Intro]
Essa é ${title || "Música IA Pro"}

[Verso 1]
Hoje eu canto sobre ${theme || "amor verdadeiro"}
No estilo ${style || "piseiro"}
Com emoção no coração
E sentimento verdadeiro

[Refrão]
Vem sentir essa batida
Vem cantar essa paixão
Music IA Pro criando
Uma nova canção

[Final]
Essa música nasceu agora
Com voz, amor e inspiração`;
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Music IA Pro</title>
<style>
body{margin:0;font-family:Arial;background:linear-gradient(135deg,#160020,#062033);color:white;padding:25px}
.card{background:rgba(255,255,255,.1);padding:22px;border-radius:20px;margin-bottom:18px}
input,textarea,select,button{width:100%;box-sizing:border-box;padding:14px;margin:8px 0;border-radius:12px;border:0;font-size:16px}
button{background:linear-gradient(135deg,#ff2fb3,#6c4dff);color:white;font-weight:bold}
pre{white-space:pre-wrap;background:rgba(0,0,0,.35);padding:15px;border-radius:12px}
</style>
</head>
<body>
<h1>🎵 Music IA Pro</h1>
<div class="card">
<h2>Criar música com voz</h2>
<input id="title" placeholder="Título da música">
<textarea id="theme" placeholder="Tema da música"></textarea>
<select id="style">
<option>Piseiro</option><option>Forró</option><option>Sertanejo</option><option>Gospel</option><option>Trap</option><option>Funk</option>
</select>
<button onclick="gerar()">Gerar música com voz</button>
</div>
<div class="card">
<h2>Resultado</h2>
<p id="status">Aguardando...</p>
<audio id="audio" controls style="width:100%;display:none"></audio>
<pre id="letra"></pre>
</div>
<script>
async function gerar(){
document.getElementById("status").innerText="Gerando música com voz...";
const r=await fetch("/api/generate-music",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
title:document.getElementById("title").value,
theme:document.getElementById("theme").value,
style:document.getElementById("style").value
})});
const data=await r.json();
document.getElementById("status").innerText=data.error||data.title;
document.getElementById("letra").innerText=data.lyrics||"";
if(data.audioUrl){
const a=document.getElementById("audio");
a.src=data.audioUrl;
a.style.display="block";
}
}
</script>
</body>
</html>
`);
});

app.get("/api/test-response", (req, res) => {
  res.json({ audioUrl: "", lyrics: "Teste funcionando", title: "Teste de Endpoint" });
});

app.post("/api/generate-music", async (req, res) => {
  const { title, theme, style } = req.body || {};
  const finalTitle = title || "Música IA Pro";
  const lyrics = criarLetra(finalTitle, theme, style);
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const modelId = process.env.ELEVENLABS_MODEL_ID || "music_v1";

  if (!apiKey) {
    return res.json({ audioUrl: "", lyrics, title: finalTitle, error: "Falta configurar ELEVENLABS_API_KEY no Render." });
  }

  try {
    const prompt = `Crie uma música cantada em português do Brasil.
Título: ${finalTitle}
Tema: ${theme || "amor verdadeiro"}
Estilo: ${style || "piseiro"}
Voz brasileira cantando clara, com melodia, bateria, baixo e arranjo profissional.
Letra:
${lyrics}`;

    const response = await fetch("https://api.elevenlabs.io/v1/music/stream", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        prompt,
        music_length_ms: 60000,
        model_id: modelId
      })
    });

    if (!response.ok) {
      const erro = await response.text();
      return res.json({ audioUrl: "", lyrics, title: finalTitle, error: "Erro ElevenLabs: " + erro });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = "music-" + Date.now() + ".mp3";
    fs.writeFileSync(path.join(generatedDir, filename), buffer);

    res.json({
      audioUrl: baseUrl(req) + "/generated/" + filename,
      lyrics,
      title: finalTitle
    });
  } catch (e) {
    res.json({ audioUrl: "", lyrics, title: finalTitle, error: e.message });
  }
});

app.listen(PORT, () => console.log("Music IA Pro rodando na porta " + PORT));
