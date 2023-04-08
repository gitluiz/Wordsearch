Array.prototype.min = function () {
  return Math.min.apply(null, this);
};
const regex_room = /(\w{3}):\/\/(\w+)-(.*?:)(\d+)(.*)/gim;
const runes = require("runes");

class RedisRoomStore {
  prefix = "room";

  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  mysort(a, b) {
    a.hs = parseInt(a.hs || 0);
    b.hs = parseInt(b.hs || 0);
    if (!a.hs) {
      a.hs = 0;
    }
    if (!b.hs) {
      b.hs = 0;
    }
    if (a.hs < b.hs) return 1;
    if (a.hs > b.hs) return -1;
    return 0;
  }

  // async remoTop10(codRoom, Lb) {
  //   let topOne = await this.getPlayerTop1(codRoom);
  //   //console.log("10:", topOne, Lb);
  //   if (topOne && topOne.Lb == Lb) {
  //     topOne.state = "dead";
  //     this.savePlayerTop1(codRoom, topOne);
  //   } else {
  //     return this.redisClient.zrem("leaderboard_set_" + codRoom, Lb);
  //   }
  // }

  async remoTop10(codRoom, Lb) {
    return this.redisClient.zrem("leaderboard_set_" + codRoom, Lb);
  }

  async saveTop10(codRoom, Player, hs) {
    if (hs > 0) {
      let tempo = 60 * 60 * 4;
      const result = await this.redisClient
        .zadd(["leaderboard_set_" + codRoom, hs, Player.Lb])
        .then(() => {
          return this.redisClient
            .zrevrank("leaderboard_set_" + codRoom, Player.Lb)
            .then(function (playerRank) {
              return playerRank;
            });
        });
      return result;
    }
  }

  modelTopForRoom() {
    return {
      qtdHs: [],
      leaderboardArr: [],
      fetchedUserCount: 0,
    };
  }

  modelTopAndRecord() {
    const modelTopAndRecord = this.modelTopForRoom();
    modelTopAndRecord.records = [];
    return modelTopAndRecord;
  }

  async findTopForRoom(codRoom, player) {
    const Lb = player.Lb;
    return this.redisClient
      .zrevrange("leaderboard_set_" + codRoom, 0, 10, "withscores")
      .then(async (leaderboard) => {
        let qtdHs = [];
        let leaderboardArr = [];
        let fetchedUserCount = 0;

        for (let i = 0; i < leaderboard.length; i += 2) {
          let pl = await this.redisClient.hmget(
            `${codRoom}:${leaderboard[i]}`,
            ["ad"]
          );
          //console.log(pl)
          let name = runes.substr(pl[0] || "--", 0, 14);
          if (name == "--") {
            this.remoTop10(codRoom, leaderboard[i])
          }
          if (leaderboard[i] != Lb) {
            qtdHs.push(leaderboard[i + 1]);
          } else {
            fetchedUserCount++;
          }

          leaderboardArr.push({
            Lb: leaderboard[i],
            hs: leaderboard[i + 1],
            ad: name,
          });
        }

        return { qtdHs, leaderboardArr, fetchedUserCount };
      });
  }

  setPlayer(player) {
    let charArabic = "﷽";
    var arabic = /[\uFDFD;]+/gim;
    player = player || {};
    return {
      Eg: player.Eg,
      Fg: player.Fg,
      Gg: player.Gg,
      Hg: player.Hg,
      Lb: player.Lb,
      fg: player.fg,
      ad: arabic.test(player.ad)
        ? player.ad.replace(charArabic, "*")
        : runes.substr(player.ad || "####", 0, 14),
      gg: player.gg,
      hs: player.hs || 0,
    };
  }

  async getPlayerRecordsAllRooms() {
    let result = [];
    const keys = await this.redisClient.keys(`top:*:*`);
    await Promise.all(
      keys.map(async (key) => {
        let org = await this.redisClient.hgetall(key);
        let obj = {
          hs: org.hs,
          name: org.ad,
          con: key.replace(/(top:\d:)/gim, ""),
        };
        result.push(obj);
      })
    );
    return result.sort(this.mysort);
  }

  async getPlayerRecords(codRoom) {
    let result = [];
    const keys = await this.redisClient.keys(`top:*:${codRoom}`);
    await Promise.all(
      keys.map(async (key) => {
        result.push(await this.redisClient.hgetall(key));
      })
    );
    return result.sort(this.mysort);
  }

  async saveRecord(codRoom, player, hs) {
    //console.log("90:", player);
    const records = await this.getPlayerRecords(codRoom);
    const len = records.length;
    let min = records.map((x) => parseInt(x.hs)).min();
    if (hs > 0 && (hs >= min || records.length < 3)) {
      let i = records.findIndex((x) => x.Lb == player.Lb);
      if (i != -1) {
        records[i] = player;
      } else {
        records.push(player);
      }
      records.sort(this.mysort);
      await Promise.all(
        records.map(async (player, index) => {
          if (index < 3) {
            await this.redisClient
              .multi()
              .hmset(`top:${index}:${codRoom}`, player)
              .exec();
          }
        })
      );
    }
    return records;
  }

  async savePlayer(codRoom, player) {
    const result = await this.redisClient
      .multi()
      .hmset(`${codRoom}:${player.Lb}`, player)
      .exec();
    this.redisClient.expire(`${codRoom}:${player.Lb}`, 60 * 60 * 2);
    return result;
  }

  async findAllPlayers(codRoom) {
    const result = {};
    const keys = await this.redisClient.keys(`${codRoom}:*`);

    await Promise.all(
      keys.map(async (key) => {
        const r = await this.redisClient.hgetall(key);
        result[r.Lb] = r;
      })
    );
    return result;
  }

  async findAllRooms() {
    const result = {};
    const keys = await this.redisClient.keys(`leaderboard_set_*`);

    await Promise.all(
      keys.map(async (key) => {
        const r = await this.redisClient
          .zrevrange(key, 0, 10, "withscores")
          .then(async (leaderboard) => {
            result[key] = leaderboard;
          });
      })
    );
    return result;
  }

  async removeTops(keys) {
    const result = [];
    for (const key in keys) {
      if (Object.hasOwnProperty.call(keys, key)) {
        this.redisClient.del(key);
      }
    }
    return result;
  }

  async removePlayer(room, Lb) {
    const result = await this.redisClient.hdel(
      `${room}:${Lb}`,
      Object.keys(this.setPlayer())
    );
    return result;
  }
}

module.exports = {
  RedisRoomStore: RedisRoomStore,
};
