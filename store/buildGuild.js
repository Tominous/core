/* eslint-disable consistent-return */
const config = require('../config');
const processGuildData = require('../processors/processGuildData');
const { logger, generateJob, getData } = require('../util/utility');
const redis = require('../store/redis');
const { insertGuild, getGuildByPlayer } = require('../store/queries');

/*
* Functions to build/cache guild object
* Currently doesn't support search by name
 */
function getGuildData(id, cb) {
  const { url } = generateJob('guild', {
    id,
  });
  getData(url, (err, body) => {
    if (err) {
      return cb(err);
    }
    // TODO - Add medal HTML parser
    const guild = processGuildData(body.guild);
    return cb(null, guild);
  });
}

function getGuildID(uuid, cb) {
  // First check if we have the player in a cached guild
  getGuildByPlayer(uuid, (err, guild) => {
    if (!err && guild !== null) {
      logger.debug(`Found cached guild for ${uuid}: ${guild.name}`);
      return cb(null, guild.id);
    }
    logger.debug(`Ǹo cached guild found for ${uuid}`);
    const { url } = generateJob('findguild', {
      id: uuid,
    });
    getData(url, (err, foundguild) => {
      if (err) {
        return cb(err);
      }
      if (foundguild.guild === null) {
        return cb('Player is not in a guild');
      }
      return cb(null, foundguild.guild);
    });
  });
}

function cacheGuild(guild, id, key, cb) {
  if (config.ENABLE_GUILD_CACHE) {
    redis.setex(key, config.GUILD_CACHE_SECONDS, JSON.stringify(guild), (err) => {
      if (err) {
        logger.error(err);
      }
    });
  }
  if (config.ENABLE_DB_CACHE) {
    insertGuild(id, guild, (err) => {
      if (err) {
        logger.error(err);
      }
    });
  }
  return cb(guild);
}

function buildGuild(uuid, cb) {
  getGuildID(uuid, (err, id) => {
    if (err) {
      return cb(err);
    }
    if (id === null) {
      return cb(null);
    }
    const key = `guild:${id}`;
    redis.get(key, (err, reply) => {
      if (err) {
        return cb(err);
      }
      if (reply) {
        const guild = JSON.parse(reply);
        return cb(null, guild);
      }
      getGuildData(id, (err, guild) => {
        if (err) {
          return cb(err);
        }
        cacheGuild(guild, id, key, guild => cb(null, guild));
      });
    });
  });
}

module.exports = buildGuild;
