import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAP_WIDTH = 100;
const MAP_HEIGHT = 60;
const TICK_MS = 150;

const app = express();
const httpServer = http.createServer(app);
const socketServer = new WebSocketServer({ server: httpServer });

// Sert le client web statique depuis le dossier ../client
app.use(express.static(path.join(__dirname, "../client")));

let currentPlayerId = 1;
const players = [];
const map = Array.from({ length: MAP_WIDTH }, () => new Array(MAP_HEIGHT).fill(0));

function send(player, data) {
  if (player.readyState === 1) {
    player.send(JSON.stringify(data));
  }
}

function sendToAll(data) {
  for (const p of players) send(p, data);
}

function clearFromMap(player) {
  for (let x = 0; x < MAP_WIDTH; x++)
    for (let y = 0; y < MAP_HEIGHT; y++)
      if (map[x][y] === player.id) map[x][y] = 0;
  sendToAll({ type: "clear", id: player.id });
}

function spawnOnMap(player) {
  // Cherche une position libre aléatoire
  let attempts = 0;
  do {
    player.x = Math.floor(Math.random() * (MAP_WIDTH - 20)) + 10;
    player.y = Math.floor(Math.random() * (MAP_HEIGHT - 20)) + 10;
    attempts++;
  } while (map[player.x][player.y] !== 0 && attempts < 100);

  player.direction = Math.floor(Math.random() * 4);
  player.alive = true;
  map[player.x][player.y] = player.id;

  send(player, { type: "spawn", id: player.id, x: player.x, y: player.y, mapWidth: MAP_WIDTH, mapHeight: MAP_HEIGHT });
  sendToAll({ type: "move", id: player.id, x: player.x, y: player.y });
}

function respawn(player) {
  clearFromMap(player);
  spawnOnMap(player);
}

socketServer.on("connection", (player) => {
  player.id = currentPlayerId++;
  player.alive = false;
  player.name = `Joueur ${player.id}`;

  console.log(`[+] Joueur ${player.id} connecté`);

  // Envoie la map actuelle au nouveau joueur
  spawnOnMap(player);
  players.push(player);
  send(player, { type: "map", map, mapWidth: MAP_WIDTH, mapHeight: MAP_HEIGHT });

  // Informe tout le monde du nombre de joueurs
  sendToAll({ type: "players", count: players.length });

  player.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (typeof msg.direction === "number") {
        const d = Math.floor(msg.direction);
        // Empêche le demi-tour
        const opposites = { 0: 1, 1: 0, 2: 3, 3: 2 };
        if (d >= 0 && d <= 3 && d !== opposites[player.direction]) {
          player.direction = d;
        }
      }
    } catch (e) {
      console.error("Message invalide:", e.message);
    }
  });

  player.on("close", () => {
    console.log(`[-] Joueur ${player.id} déconnecté`);
    clearFromMap(player);
    const idx = players.indexOf(player);
    if (idx > -1) players.splice(idx, 1);
    sendToAll({ type: "players", count: players.length });
  });

  player.on("error", () => {});
});

// Game loop
setInterval(() => {
  const collisions = new Set();

  for (const player of players) {
    if (!player.alive) continue;

    if (player.direction === 0) player.y -= 1;
    else if (player.direction === 1) player.y += 1;
    else if (player.direction === 2) player.x -= 1;
    else if (player.direction === 3) player.x += 1;

    // Collision mur ou traîne
    if (
      player.x < 0 || player.y < 0 ||
      player.x >= MAP_WIDTH || player.y >= MAP_HEIGHT ||
      map[player.x][player.y] > 0
    ) {
      collisions.add(player);
      // Collision frontale entre deux joueurs
      for (const other of players) {
        if (other !== player && other.x === player.x && other.y === player.y) {
          collisions.add(other);
        }
      }
    } else {
      map[player.x][player.y] = player.id;
      sendToAll({ type: "move", id: player.id, x: player.x, y: player.y });
    }
  }

  for (const player of collisions) {
    respawn(player);
  }
}, TICK_MS);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`✅ Serveur Tron démarré sur le port ${PORT}`));
