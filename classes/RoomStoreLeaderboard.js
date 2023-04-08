import runes from "runes";

function sanitizePlayerName(playerName) {
  const arabicRegex = /﷽+/g;
  playerName = runes.substr(
    (playerName || "").replace(arabicRegex, " "),
    0,
    18
  );
  return playerName;
}

export default class RoomStoreLeaderboard {
  prefix = "room";
  constructor(redisClient, prefix) {
    this.redisClient = redisClient;
    if (prefix) {
      this.prefix = prefix;
    }
  }

  xxsanitizePlayerName(namePlayer) {
    return sanitizePlayerName(namePlayer);
  }

  async savePlayer(codRoom, player) {
    const result = await this.redisClient
      .multi()
      .hmset(`${codRoom}:${player.refer}`, player)
      .exec();
    this.redisClient.expire(`${codRoom}:${player.refer}`, 60 * 60 * 2);
    return result;
  }

  async findAllPlayers(codRoom) {
    const result = {};
    const keys = await this.redisClient.keys(`${codRoom}:*`);
    console.log(keys);
    if (Array.isArray(keys)) {
      await Promise.all(
        keys.map(async (key) => {
          const r = await this.redisClient.hgetall(key);
          result[r.refer] = r;
        })
      );
    }
    return result;
  }

  async addLeaderboard(codRoom, player) {
    try {
      let top3 = await this.leaderboard(codRoom, "top3");
      let top10 = await this.leaderboard(codRoom, "top10");

      const stayOnTop3 =
        top3 === false ||
        top3.length < 3 ||
        player.score > top3[top3.length - 1].score;

      const stayOnTop10 =
        top10 === false ||
        top10.length < 10 ||
        player.score > top10[top10.length - 1].score;

      if (stayOnTop3) {
        await this.redisClient.zadd(
          `top3_${codRoom}`,
          parseInt(player.score),
          `${player.refer}`
        );
        top3 = await this.leaderboard(codRoom, "top3");
      }
      if (stayOnTop10) {
        await this.redisClient.zadd(
          `top10_${codRoom}`,
          parseInt(player.score),
          `${player.refer}:${sanitizePlayerName(player.nickname)}`
        );

        top10 = await this.leaderboard(codRoom, "top10");
      }
      return { top3, top10 };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async addLeaderboardAc(codRoom, player) {
    try {
      let top3 = await this.leaderboard(codRoom, "top3");
      let top10 = await this.leaderboard(codRoom, "top10");

      const stayOnTop3 =
        top3 === false ||
        top3.length < 3 ||
        player.score > top3[top3.length - 1].score;

      const stayOnTop10 =
        top10 === false ||
        top10.length < 10 ||
        player.score > top10[top10.length - 1].score;

      // Obter a pontuação atual do jogador
      const currentScore = await this.redisClient.zscore(
        `top10_${codRoom}`,
        `${player.id}`
      );

      const newScore = currentScore
        ? parseInt(currentScore) + player.score
        : player.score;

      if (stayOnTop3) {
        await this.redisClient.zadd(
          `top3_${codRoom}`,
          newScore,
          `${player.id}`
        );
        top3 = await this.leaderboard(codRoom, "top3");
      }
      if (stayOnTop10) {
        await this.redisClient.zadd(
          `top10_${codRoom}`,
          newScore,
          `${player.id}`
        );

        top10 = await this.leaderboard(codRoom, "top10");
      }
      return { top3, top10 };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async removeLeaderboard(codRoom, player) {
    this.redisClient.zrem(
      `top10_${codRoom}`,
      `${player.refer}:${sanitizePlayerName(player.nickname)}`
    );
  }

  async leaderboard(codRoom, refer) {
    try {
      const result = await new Promise((resolve, reject) => {
        this.redisClient.zrevrange(
          `${refer}_${codRoom}`,
          0,
          10,
          "WITHSCORES",
          (err, result) => {
            if (err) reject(err);
            console.log("plain range:", result);
            resolve(result);
          }
        );
      });

      if (result.length === 0) {
        return [];
      }

      const members = [];
      for (let i = 0; i < result.length; i += 2) {
        const [refer, nickname] = result[i].split(":");
        const score = parseInt(result[i + 1]);
        members.push({ refer, nickname, score });
      }
      return members;
    } catch (error) {
      console.error(
        `Error retrieving leaderboard for room ${refer}_${codRoom}:`,
        error
      );
      return [];
    }
  }

  async leaderboardFull(codRoom, refer) {
    try {
      const result = await new Promise((resolve, reject) => {
        this.redisClient.zrevrange(
          `${refer}_${codRoom}`,
          0,
          10,
          "WITHSCORES",
          (err, result) => {
            if (err) reject(err);
            console.log("plain range:", result);
            resolve(result);
          }
        );
      });

      if (result.length === 0) {
        return [];
      }

      const members = [];
      for (let i = 0; i < result.length; i += 2) {
        const [refer, nickname] = result[i].split(":");
        const score = parseInt(result[i + 1]);

        // Buscar informações do usuário pelo ID (refer)
        const user = await this.redisClient.hgetall(`user:${refer}`);

        if (user) {
          members.push({
            refer,
            name: user.name,
            email: user.email,
            nickname,
            score,
          });
        } else {
          members.push({ refer, nickname, score });
        }
      }
      return members;
    } catch (error) {
      console.error(
        `Error retrieving leaderboard for room ${refer}_${codRoom}:`,
        error
      );
      return [];
    }
  }

  async saveUser(user) {
    try {
      // Usar o e-mail como chave e UUID como valor
      await this.redisClient.set(user.email, user.id);
      return true;
    } catch (error) {
      console.error("Error saving user:", error);
      return false;
    }
  }

  async saveUserComplete({ name, email, id }) {
    try {
      // Substitua o código abaixo pela lógica de salvar o nome, e-mail e ID do usuário no seu banco de dados
      await this.redisClient.hmset(`user:${id}`, {
        name,
        email,
      });

      return true;
    } catch (error) {
      console.error("Failed to save user:", error);
      return false;
    }
  }
  async getUserById(id) {
    try {
      const userInfo = await this.redisClient.hgetall(`user:${id}`);
      if (userInfo) {
        return { ...userInfo, id };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error retrieving user by id ${id}:`, error);
      return null;
    }
  }
  async getUserByEmail(email) {
    try {
      const userId = await this.redisClient.get(email);
      if (userId && userId !== true) {
        // Obter as informações adicionais do usuário
        const userInfo = await this.redisClient.hgetall(`user:${userId}`);
        const { name } = userInfo;

        // Obter a pontuação do usuário
        const score = await this.redisClient.zscore(
          `top10_${userId.split(":")[0]}`, // Use o código da sala (codRoom) do ID do usuário
          `${userId}:${sanitizePlayerName(name)}`
        );

        return { name, email, id: userId, score: parseInt(score) };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error retrieving user by email ${email}:`, error);
      return null;
    }
  }
}
