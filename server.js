const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send(`
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Music IA Pro</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg,#160020,#062033);
          color: white;
          padding: 25px;
        }
        .card {
          background: rgba(255,255,255,.1);
          padding: 22px;
          border-radius: 20px;
          margin-bottom: 18px;
        }
        input, textarea, select, button {
          width: 100%;
          padding: 14px;
          margin: 8px 0;
          border-radius: 12px;
          border: 0;
          font-size: 16px;
        }
        button {
          background: linear-gradient(135deg,#ff2fb3,#6c4dff);
          color: white;
          font-weight: bold;
        }
        pre {
          white-space: pre-wrap;
          background: rgba(0,0,0,.35);
          padding: 15px;
          border-radius: 12px;
        }
      </style>
    </head>
    <body>
      <h1>🎵 Music IA Pro</h1>
      <div class="card">
        <h2>Criar música</h2>
        <input id="title" placeholder="Título da música">
        <textarea id="theme" placeholder="Tema da música"></textarea>
        <select id="style">
          <option>Piseiro</option>
          <option>Forró</option>
          <option>Sertanejo</option>
          <option>Gospel</option>
          <option>Trap</option>
          <option>Funk</option>
        </select>
        <button onclick="gerar()">Gerar música</button>
      </div>

      <div class="card">
        <h2>Resultado</h2>
        <p id="status">Aguardando...</p>
        <audio id="audio" controls style="width:100%;display:none"></audio>
        <pre id="letra"></pre>
      </div>

      <script>
        async function gerar() {
          document.getElementById("status").innerText = "Gerando...";
          const r = await fetch("/api/generate-music", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              title: document.getElementById("title").value,
              theme: document.getElementById("theme").value,
              style: document.getElementById("style").value
            })
          });
          const data = await r.json();
          document.getElementById("status").innerText = data.title;
          document.getElementById("letra").innerText = data.lyrics;
          if (data.audioUrl) {
            const audio = document.getElementById("audio");
            audio.src = data.audioUrl;
            audio.style.display = "block";
          }
        }
      </script>
    </body>
  </html>
  `);
});

function criarLetra(title, theme, style) {
  return `[Intro]
Essa é ${title || "Minha Música IA"}

[Verso 1]
Hoje eu vou cantar sobre ${theme || "amor verdadeiro"}
No estilo ${style || "piseiro"}
Com sentimento no peito
E verdade no coração

[Refrão]
Vem sentir essa batida
Vem cantar essa emoção
Music IA Pro criando
Uma nova inspiração

[Final]
Essa canção nasceu agora
Com tecnologia e amor
Uma música original
Com sentimento e valor`;
}

app.get("/api/test-response", (req, res) => {
  res.json({
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    lyrics: "[Intro]\\nTeste de resposta correta do endpoint.",
    title: "Teste de Endpoint"
  });
});

app.post("/api/generate-music", async (req, res) => {
  const { title, theme, style } = req.body || {};
  const finalTitle = title || "Música IA Pro";
  const lyrics = criarLetra(finalTitle, theme, style);

  res.json({
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    lyrics,
    title: finalTitle
  });
});

app.listen(PORT, () => {
  console.log("Music IA Pro rodando na porta " + PORT);
});
