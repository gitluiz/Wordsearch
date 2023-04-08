import express from "express";
import path from "path";
import dotenv from "dotenv-safe";
import cors from "cors";
import { createClient } from "redis";
import RoomStoreLeaderboard from "./classes/RoomStoreLeaderboard.js";

import { v4 as uuidv4 } from "uuid";

function generateUserId() {
  return uuidv4();
}

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "production";
const app = express();

const originList = ["http://localhost:4500"];

const corsOptions = {
  origin: originList,
  optionsSuccessStatus: 200,
};

const __dirname = path.resolve();

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "/")));
app.use(express.json());

const PORT = NODE_ENV !== "production" ? 4500 : process.env.PORT;

app.listen(PORT, () => {
  console.log("SOCKET listening on port " + PORT);
});

const pubClient = createClient(process.env.REDISCLOUD_URL);

const redisRoomStore = new RoomStoreLeaderboard(pubClient);

const gameModel = function (socket, obj) {
  obj = obj || {};
  return {
    players: obj.players || [],
    connected: obj.connected || 0,
    room: nameRoom(obj.room || "default"),
    leaderboard: obj.leaderboard || [],
    leaderboardTop3: obj.leaderboardTop3 || [],
    refer: obj.refer || socket.id,
    score: obj.score || 0,
    nickname: obj.nickname || "",
  };
};

const nameRoom = function (room) {
  return room.replace(/[^\w\s]/gi, "");
};

async function updateGamePlay(socket, obj) {
  saveGameModel(socket, obj);
  socket.gamePlay.leaderboard = await redisRoomStore.leaderboard(
    socket.gamePlay.room,
    "top10"
  );
  socket.gamePlay.leaderboardTop3 = await redisRoomStore.leaderboard(
    socket.gamePlay.room,
    "top3"
  );
}

async function leaveRoom(socket) {
  if (socket.gamePlay) {
    await redisRoomStore.removeLeaderboard(
      socket.gamePlay.room,
      socket.gamePlay
    );
    let hasl = socket.gamePlay.leaderboard.some((item) => {
      return item.refer == socket.gamePlay.refer;
    });
    if (hasl) {
      socket.gamePlay.leaderboard = await redisRoomStore.leaderboard(
        socket.gamePlay.room,
        "top10"
      );
      socket.gamePlay.leaderboardTop3 = await redisRoomStore.leaderboard(
        socket.gamePlay.room,
        "top3"
      );
      game.to(socket.gamePlay.room).emit("leaderboardUpdated", socket.gamePlay);
    }
    socket.leave(socket.gamePlay.room);
    consoleInTest(
      "SOCKET disconnected from wormworld namespace",
      socket.gamePlay
    );
  }
}

async function saveGameModel(socket, obj) {
  socket.gamePlay = gameModel(socket, obj);
}

function consoleInTest(msg, obj) {
  if (NODE_ENV !== "production") {
    console.log(msg);
    if (obj) console.log(obj);
  }
}

async function emailExists(email) {
  // Substitua o código abaixo pela lógica de consulta ao seu banco de dados
  const result = await redisRoomStore.getUserByEmail(email);

  // Se encontrou um usuário com o mesmo e-mail, retorna o ID do usuário
  if (result) {
    if(result.id == true || result.id == false){
      result.id = generateUserId();
      redisRoomStore.saveUser({
        email: email,
        id: result.id,
      });      
    }
    return result.id;
  }

  // Caso contrário, retorna falso
  return false;
}

app.post("/register", async (req, res) => {
  try {
    const user = req.body;

    // Verificar se o e-mail já existe
    const existingUserId = await emailExists(user.email);

    if (existingUserId) {
      // Se o e-mail já existe, envie uma resposta com o ID de usuário existente
      res.json({ id: existingUserId });
    } else {
      const userId = generateUserId();

      // Salvar o e-mail e o UUID do usuário no Redis
      const saved = await redisRoomStore.saveUser({
        email: user.email,
        id: userId,
      });

      if (saved) {
        // Envie a resposta com o ID de usuário gerado
        res.json({ id: userId });
      } else {
        // Se houver um erro ao salvar o usuário, envie uma resposta com o status 500 e uma mensagem de erro
        res.status(500).json({ error: "Failed to save user" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to save user" });
  }
});

const middlewareSetRoom = function (req, next) {
  const room = (req.params.room = "SUAS360");
  next();
};

// Adicionar jogador ao ranking
app.post("/leaderboard/:room/add", middlewareSetRoom, async (req, res) => {
  const room = nameRoom(req.params.room);
  const player = req.body;
  // Adicione o jogador ao ranking usando sua lógica atual
  const leaderboard = await redisRoomStore.addLeaderboard(room, player);

  res.json(leaderboard);
});

// Remover jogador do ranking
app.post("/leaderboard/:room/remove", middlewareSetRoom, async (req, res) => {
  const room = nameRoom(req.params.room);
  const player = req.body;
  // Remova o jogador do ranking usando sua lógica atual
  await redisRoomStore.removeLeaderboard(room, player);

  res.sendStatus(200);
});

// Obter o ranking (Top 10)
app.get("/leaderboard/:room/top10", middlewareSetRoom, async (req, res) => {
  const room = nameRoom(req.params.room);
  // Obtenha o top 10 usando sua lógica atual
  const leaderboard = await redisRoomStore.leaderboard(room, "top10");

  res.json(leaderboard);
});

// Obter o ranking (Top 3)
app.get("/leaderboard/:room/top3", middlewareSetRoom, async (req, res) => {
  const room = nameRoom(req.params.room);
  // Obtenha o top 3 usando sua lógica atual
  const leaderboard = await redisRoomStore.leaderboard(room, "top3");

  res.json(leaderboard);
});

app.all("*", (req, res) => {
  res.json({ message: "Hello, world!" });
});
