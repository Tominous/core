/* eslint-disable consistent-return */
const async = require('async');
const getUUID = require('../store/getUUID');
const buildPlayer = require('../store/buildPlayer');
const buildGuild = require('../store/buildGuild');
const buildBans = require('../store/buildBans');
const buildBoosters = require('../store/buildBoosters');
const buildSession = require('../store/buildSession');
const leaderboards = require('../store/leaderboards');
const { getPlayerProfile } = require('../store/queries');
const { logger, getProfileFields } = require('../util/utility');
const {
  playerNameParam, gameNameParam, typeParam, columnParam, filterParam, sortByParam, limitParam, significantParam, populatePlayersParam,
} = require('./params');
const packageJson = require('../package.json');

function getPlayer(req, res, cb) {
  getUUID(req.params.player, (err, uuid) => {
    if (err) {
      return cb({ status: 404, message: err });
    }
    buildPlayer(uuid, (err, player) => {
      if (err) {
        return cb({ status: 500, message: err });
      }
      return cb(null, player);
    });
  });
}

function populatePlayers(players, cb) {
  async.map(players, (player, done) => {
    const { uuid } = player;
    getPlayerProfile(uuid, (err, profile) => {
      if (err) {
        logger.error(err);
      }
      if (profile === null) {
        logger.debug(`[populatePlayers] ${uuid} not found in DB, generating...`);
        buildPlayer(uuid, (err, newPlayer) => {
          delete player.uuid;
          player.profile = getProfileFields(newPlayer);
          done(err, player);
        });
      } else {
        delete player.uuid;
        player.profile = profile;
        done(err, player);
      }
    });
  }, (err, result) => {
    cb(result);
  });
}

const spec = {
  openapi: '3.0.0',
  servers: [
    {
      url: 'https://api.slothpixel.me/api',
    },
  ],
  info: {
    description: 'The Slothpixel API provides Hypixel related data.\n',
    version: packageJson.version,
    title: 'Slothpixel API',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  tags: [
    {
      name: 'player',
      description: 'Player stats',
    },
    {
      name: 'guild',
      description: 'Guild stats',
    },
    {
      name: 'friends',
      description: 'Player friends',
    },
    {
      name: 'session',
      description: 'Player session',
    },
    {
      name: 'leaderboards',
      description: 'Player leaderboards',
    },
    {
      name: 'boosters',
      description: 'List of Boosters',
    },
    {
      name: 'bans',
      description: 'Ban statistics',
    },
  ],
  paths: {
    '/players/{playerName}': {
      get: {
        tags: [
          'player',
        ],
        summary: 'Get player stats by name or uuid',
        description: 'Returns player stats',
        parameters: [
          playerNameParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    uuid: {
                      description: 'Player uuid',
                      type: 'string',
                    },
                    username: {
                      description: 'Player username',
                      type: 'string',
                    },
                    online: {
                      description: 'Is player online',
                      type: 'boolean',
                    },
                    rank: {
                      description: 'Player rank',
                      type: 'string',
                    },
                    rank_plus_color: {
                      description: 'Color code for MVP+(+)',
                      type: 'string',
                      'x-default_value': '&c',
                    },
                    rank_formatted: {
                      description: 'Formatted rank string',
                      type: 'string',
                    },
                    prefix: {
                      description: 'Custom rank prefix',
                      type: 'string',
                    },
                    karma: {
                      description: 'Player karma',
                      type: 'integer',
                    },
                    exp: {
                      description: 'Current Hypixel Experience',
                      type: 'integer',
                    },
                    level: {
                      description: 'Player level with precision of two decimals',
                      type: 'number',
                    },
                    achievement_points: {
                      description: 'Total achievement points',
                      type: 'integer',
                    },
                    quests_completed: {
                      description: 'Total quests completed',
                      type: 'integer',
                    },
                    total_kills: {
                      description: 'Total kills across all minigames',
                      type: 'integer',
                    },
                    total_wins: {
                      description: 'Total wins across all minigames',
                      type: 'integer',
                    },
                    total_coins: {
                      description: 'Total coins across all minigames',
                      type: 'integer',
                    },
                    mc_version: {
                      description: 'Minecraft version the user last logged on Hypixel with',
                      type: 'string',
                    },
                    first_login: {
                      description: 'Date of first Hypixel login',
                      type: 'string',
                    },
                    last_login: {
                      description: 'Date of latest Hypixel login',
                      type: 'string',
                    },
                    last_game: {
                      description: 'Latest minigame played',
                      type: 'string',
                    },
                    language: {
                      description: 'Currently selected language',
                      type: 'string',
                    },
                    gifts_sent: {
                      description: 'Total gifts sent to other players',
                      type: 'integer',
                    },
                    gifts_received: {
                      description: 'Total gifts received from other players',
                      type: 'integer',
                    },
                    is_contributor: {
                      description: 'Whether player is a contributor to Slothpixel',
                      type: 'boolean',
                    },
                    rewards: {
                      description: 'Daily reward data',
                      type: 'object',
                      properties: {
                        streak_current: {
                          description: 'Current streak',
                          type: 'integer',
                        },
                        streak_best: {
                          description: 'Best streak',
                          type: 'integer',
                        },
                        claimed: {
                          description: 'Total rewards claimed',
                          type: 'integer',
                        },
                        claimed_daily: {
                          description: 'Daily rewards claimed',
                          type: 'integer',
                        },
                        tokens: {
                          description: 'Current reward tokens',
                          type: 'integer',
                        },
                      },
                    },
                    links: {
                      description: 'Social media links',
                      type: 'object',
                      properties: {
                        TWITTER: {
                          description: 'Link to Twitter profile',
                          type: 'string',
                        },
                        YOUTUBE: {
                          description: 'Link to YouTube channel',
                          type: 'string',
                        },
                        INSTAGRAM: {
                          description: 'Link to Instagram profile',
                          type: 'string',
                        },
                        TWITCH: {
                          description: 'Link to Twitch channel',
                          type: 'string',
                        },
                        MIXER: {
                          description: 'Link to Mixer channel',
                          type: 'string',
                        },
                        DISCORD: {
                          description: 'Discord handle, in full format of username#discriminator',
                          type: 'string',
                        },
                        HYPIXEL: {
                          description: 'Link to Hypixel Forums profile',
                          type: 'string',
                        },
                      },
                    },
                    stats: {
                      description: 'Player stats across all minigames',
                      type: 'object',
                      properties: {
                        Arcade: {
                          description: 'Player stats in the Arcade Games',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in the Arcade Games',
                              type: 'integer',
                            },
                          },
                        },
                        Arena: {
                          description: 'Player stats in Arena Brawl',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins',
                              type: 'integer',
                            },
                            coins_spent: {
                              description: 'Total coins spent in Arena Brawl',
                              type: 'integer',
                            },
                            hat: {
                              description: 'Currently selected hat cosmetic',
                              type: 'string',
                            },
                            penalty: {
                              type: 'integer',
                            },
                            magical_chest: {
                              type: 'integer',
                            },
                            keys: {
                              description: 'Current number of Magical Chest keys',
                              type: 'integer',
                            },
                            selected_sword: {
                              description: 'Currently selected Sword cosmetic',
                              type: 'string',
                            },
                            active_rune: {
                              type: 'string',
                            },
                            skills: {
                              description: 'Currently selected skills',
                              type: 'object',
                              properties: {
                                offensive: {
                                  description: 'Currently selected Offensive skill',
                                  type: 'string',
                                },
                                support: {
                                  description: 'Currently selected Support skill',
                                  type: 'string',
                                },
                                utility: {
                                  description: 'Currently selected Utility skill',
                                  type: 'string',
                                },
                                ultimate: {
                                  description: 'Currently selected Ultimate skill',
                                  type: 'string',
                                },
                              },
                            },
                            combat_levels: {
                              description: 'Current Combat Upgrades in Arena Brawl',
                              type: 'object',
                              properties: {
                                melee: {
                                  description: 'Current Melee Upgrade progression',
                                  type: 'integer',
                                },
                                health: {
                                  description: 'Current Health Upgrade progression',
                                  type: 'integer',
                                },
                                energy: {
                                  description: 'Current Energy Upgrade progression',
                                  type: 'integer',
                                },
                                cooldown: {
                                  description: 'Current Cooldown Upgrade progression',
                                  type: 'integer',
                                },
                              },
                            },
                            rune_levels: {
                              description: 'Current rune upgrades in Arena Brawl',
                              type: 'object',
                              properties: {
                                damage: {
                                  description: 'Rune of Damage upgrade progression',
                                  type: 'integer',
                                },
                                energy: {
                                  description: 'Rune of Energy upgrade progression',
                                  type: 'integer',
                                },
                                slowing: {
                                  description: 'Rune of Slowing upgrade progression',
                                  type: 'integer',
                                },
                                speed: {
                                  description: 'Rune of Speed upgrade progression',
                                  type: 'integer',
                                },
                              },
                            },
                            gamemodes: {
                              description: 'Stats in specific Arena gamemodes',
                              type: 'object',
                              properties: {
                                one_v_one: {
                                  description: 'Specific stats in 1v1 Arena',
                                  type: 'object',
                                  properties: {
                                    damage: {
                                      description: 'Total damage dealt in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    kills: {
                                      description: 'Total kills in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    deaths: {
                                      description: 'Total deaths in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    losses: {
                                      description: 'Total losses in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    wins: {
                                      description: 'Total wins in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    win_streaks: {
                                      description: 'Highest win streak in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    games: {
                                      description: 'Total games played in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    healed: {
                                      description: 'Total health healed in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    kd: {
                                      description: 'Kill/death ratio in 1v1 Arena',
                                      type: 'number',
                                    },
                                    win_loss: {
                                      description: 'Win/loss ratio in 1v1 Arena',
                                      type: 'number',
                                    },
                                    win_percentage: {
                                      description: 'Win percentage out of games played in 1v1 Arena',
                                      type: 'number',
                                    },
                                  },
                                },
                                two_v_two: {
                                  description: 'Specific stats in 2v2 Arena',
                                  type: 'object',
                                  properties: {
                                    damage: {
                                      description: 'Total damage dealt in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    kills: {
                                      description: 'Total kills in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    deaths: {
                                      description: 'Total deaths in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    losses: {
                                      description: 'Total losses in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    wins: {
                                      description: 'Total wins in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    win_streaks: {
                                      description: 'Highest win streak in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    games: {
                                      description: 'Total games played in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    healed: {
                                      description: 'Total health healed in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    kd: {
                                      description: 'Kill/death ratio in 2v2 Arena',
                                      type: 'number',
                                    },
                                    win_loss: {
                                      description: 'Win/loss ratio in 2v2 Arena',
                                      type: 'number',
                                    },
                                    win_percentage: {
                                      description: 'Win percentage out of games played in 2v2 Arena',
                                      type: 'number',
                                    },
                                  },
                                },
                                four_v_four: {
                                  description: 'Specific stats in 4v4 Arena',
                                  type: 'object',
                                  properties: {
                                    damage: {
                                      description: 'Total damage dealt in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    kills: {
                                      description: 'Total kills in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    deaths: {
                                      description: 'Total deaths in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    losses: {
                                      description: 'Total losses in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    wins: {
                                      description: 'Total wins in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    win_streaks: {
                                      description: 'Highest win streak in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    games: {
                                      description: 'Total games played in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    healed: {
                                      description: 'Total health healed in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    kd: {
                                      description: 'Kill/death ratio in 4v4 Arena',
                                      type: 'number',
                                    },
                                    win_loss: {
                                      description: 'Win/loss ratio in 4v4 Arena',
                                      type: 'number',
                                    },
                                    win_percentage: {
                                      description: 'Win percentage out of games played in 4v4 Arena',
                                      type: 'number',
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        Warlords: {
                          description: 'Player stats in Warlords',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Warlords',
                              type: 'integer',
                            },
                          },
                        },
                        BedWars: {
                          description: 'Player stats in Bedwars',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Bedwars',
                              type: 'integer',
                            },
                          },
                        },
                        BuildBattle: {
                          description: 'Player stats in Build Battle',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Build Battle',
                              type: 'integer',
                            },
                          },
                        },
                        Duels: {
                          description: 'Player stats in Duels',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Duels',
                              type: 'integer',
                            },
                          },
                        },
                        TKR: {
                          description: 'Current stats in Turbo Kart Racers',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Turbo Kart Racers',
                              type: 'integer',
                            },
                            coin_pickups: {
                              description: 'Total coins picked up in Turbo Kart Racers',
                              type: 'integer',
                            },
                            laps: {
                              description: 'Total laps completed in Turbo Kart Racers',
                              type: 'integer',
                            },
                            wins: {
                              description: 'Total wins in Turbo Kart Racers',
                              type: 'integer',
                            },
                            box_pickups: {
                              description: 'Total powerups collected in Turbo Kart Racers',
                              type: 'integer',
                            },
                            bananas_sent: {
                              description: 'Total successful hits by your bananas in Turbo Kart Racers',
                              type: 'integer',
                            },
                            bananas_received: {
                              description: 'Total bananas slipped on in Turbo Kart Racers',
                              type: 'integer',
                            },
                            banana_ratio: {
                              description: 'Ratio of banana hits to bananas slipped on',
                              type: 'number',
                            },
                            trophies: {
                              description: 'Stats for trophies won in Turbo Kart Racers',
                              type: 'object',
                              properties: {
                                gold: {
                                  description: 'Total gold trophies (first place) won in Turbo Kart Racers',
                                  type: 'integer',
                                },
                                silver: {
                                  description: 'Total silver trophies (second place) won in Turbo Kart Racers',
                                  type: 'integer',
                                },
                                bronze: {
                                  description: 'Total bronze trophies (third place) won in Turbo Kart Racers',
                                  type: 'integer',
                                },
                              },
                            },
                            maps: {
                              description: 'Player stats on specific maps in Turbo Kart Racers',
                              type: 'object',
                              properties: {
                                retro: {
                                  description: 'Player stats on the Retro map in Turbo Kart Racers',
                                  type: 'object',
                                  properties: {
                                    games: {
                                      description: 'Total games played on Retro',
                                      type: 'integer',
                                    },
                                    win_ratio: {
                                      description: 'Ratio of wins to games played on Retro',
                                      type: 'number',
                                    },
                                    trophies: {
                                      description: 'Trophies won on Retro',
                                      type: 'object',
                                      properties: {
                                        gold: {
                                          description: 'Gold trophies won on Retro',
                                          type: 'integer',
                                        },
                                        silver: {
                                          description: 'Silver trophies won on Retro',
                                          type: 'integer',
                                        },
                                        bronze: {
                                          description: 'Bronze trophies won on Retro',
                                          type: 'integer',
                                        },
                                      },
                                    },
                                  },
                                },
                                hypixelgp: {
                                  description: 'Player stats on the Hypixel GP map in Turbo Kart Racers',
                                  type: 'object',
                                  properties: {
                                    games: {
                                      description: 'Total games played on Hypixel GP',
                                      type: 'integer',
                                    },
                                    win_ratio: {
                                      description: 'Ratio of wins to games played on Hypixel GP',
                                      type: 'number',
                                    },
                                    trophies: {
                                      description: 'Trophies won on Hypixel GP',
                                      type: 'object',
                                      properties: {
                                        gold: {
                                          description: 'Gold trophies won on Hypixel GP',
                                          type: 'integer',
                                        },
                                        silver: {
                                          description: 'Silver trophies won on Hypixel GP',
                                          type: 'integer',
                                        },
                                        bronze: {
                                          description: 'Bronze trophies won on Hypixel GP',
                                          type: 'integer',
                                        },
                                      },
                                    },
                                  },
                                },
                                junglerush: {
                                  description: 'Player stats on the Jungle Rush map in Turbo Kart Racers',
                                  type: 'object',
                                  properties: {
                                    games: {
                                      description: 'Total games played on Jungle Rush',
                                      type: 'integer',
                                    },
                                    win_ratio: {
                                      description: 'Ratio of wins to games played on Jungle Rush',
                                      type: 'number',
                                    },
                                    trophies: {
                                      description: 'Trophies won on Jungle Rush',
                                      type: 'object',
                                      properties: {
                                        gold: {
                                          description: 'Gold trophies won on Jungle Rush',
                                          type: 'integer',
                                        },
                                        silver: {
                                          description: 'Silver trophies won on Jungle Rush',
                                          type: 'integer',
                                        },
                                        bronze: {
                                          description: 'Bronze trophies won on Jungle Rush',
                                          type: 'integer',
                                        },
                                      },
                                    },
                                  },
                                },
                                olympus: {
                                  description: 'Player stats on the Olympus map in Turbo Kart Racers',
                                  type: 'object',
                                  properties: {
                                    games: {
                                      description: 'Total games played on Olympus',
                                      type: 'integer',
                                    },
                                    win_ratio: {
                                      description: 'Ratio of wins to games played on Olympus',
                                      type: 'number',
                                    },
                                    trophies: {
                                      description: 'Trophies won on Olympus',
                                      type: 'object',
                                      properties: {
                                        gold: {
                                          description: 'Gold trophies won on Olympus',
                                          type: 'integer',
                                        },
                                        silver: {
                                          description: 'Silver trophies won on Olympus',
                                          type: 'integer',
                                        },
                                        bronze: {
                                          description: 'Bronze trophies won on Olympus',
                                          type: 'integer',
                                        },
                                      },
                                    },
                                  },
                                },
                                canyon: {
                                  description: 'Player stats on the Canyon map in Turbo Kart Racers',
                                  type: 'object',
                                  properties: {
                                    games: {
                                      description: 'Total games played on Canyon',
                                      type: 'integer',
                                    },
                                    win_ratio: {
                                      description: 'Ratio of wins to games played on Canyon',
                                      type: 'number',
                                    },
                                    trophies: {
                                      description: 'Trophies won on Canyon',
                                      type: 'object',
                                      properties: {
                                        gold: {
                                          description: 'Gold trophies won on Canyon',
                                          type: 'integer',
                                        },
                                        silver: {
                                          description: 'Silver trophies won on Canyon',
                                          type: 'integer',
                                        },
                                        bronze: {
                                          description: 'Bronze trophies won on Canyon',
                                          type: 'integer',
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        Blitz: {
                          description: 'Player stats in Blitz Survival Games',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Blitz Survival Games',
                              type: 'integer',
                            },
                            deaths: {
                              description: 'Total deaths in Blitz Survival Games',
                              type: 'integer',
                            },
                            kills: {
                              description: 'Total kills in Blitz Survival Games',
                              type: 'integer',
                            },
                            kd: {
                              description: 'Ratio of kills to deaths in Blitz Survival Games',
                              type: 'number',
                            },
                            wins: {
                              description: 'Total wins in Solo Blitz Survival Games',
                              type: 'integer',
                            },
                            team_wins: {
                              description: 'Total wins in Teams Blitz Survival Games',
                              type: 'integer',
                            },
                            win_loss: {
                              description: 'Ratio of total wins to losses in Blitz Survival Games',
                              type: 'number',
                            },
                            win_percentage: {
                              description: 'Percentage of games won out of total games played in Blitz Survival Games',
                              type: 'integer',
                            },
                            weekly_kills: {
                              description: 'Current weekly kills in Blitz Survival Games',
                              type: 'integer',
                            },
                            monthly_kills: {
                              description: 'Current monthly kills in Blitz Survival Games',
                              type: 'integer',
                            },
                            rambo_wins: {
                              description: 'Total games won with the Rambo kit in Blitz Survival Games',
                              type: 'integer',
                            },
                            random_wins: {
                              description: 'Total games won with a random kit in Blitz Survival Games',
                              type: 'integer',
                            },
                            damage_taken: {
                              description: 'Total damage taken in Blitz Survival Games',
                              type: 'integer',
                            },
                            taunt_kills: {
                              description: 'Total players killed while using a taunt in Blitz Survival Games',
                              type: 'integer',
                            },
                            potions_drunk: {
                              description: 'Total potions drunk in Blitz Survival Games',
                              type: 'integer',
                            },
                            damage: {
                              description: 'Total damage dealt in Blitz Survival Games',
                              type: 'integer',
                            },
                            mobs_spawned: {
                              description: 'Total mobs spawned by the player in Blitz Survival Games',
                              type: 'integer',
                            },
                            time_played: {
                              description: 'Total playtime in Blitz Survival Games',
                              type: 'number',
                            },
                            arrows_hit: {
                              description: 'Successful arrow shots landed in Blitz Survival Games',
                              type: 'integer',
                            },
                            games_played: {
                              description: 'Total games of Blitz Survival Games played',
                              type: 'number',
                            },
                            potions_thrown: {
                              description: 'Total splash potions thrown in Blitz Survival Games',
                              type: 'integer',
                            },
                            arrows_fired: {
                              description: 'Total arrows shot in blitz survival games',
                              type: 'integer',
                            },
                            blitz_uses: {
                              description: 'Total number of Blitz Stars used in Blitz Survival Games',
                              type: 'integer',
                            },
                            kits_levels: {
                              description: 'Player\'s current kit levels in Blitz Survival Games',
                              type: 'object',
                            },
                            kit_stats: {
                              description: 'Specific stats with a kit in Blitz Survival Games',
                              type: 'object',
                            },
                            equipped: {
                              description: 'Player\'s current cosmetics equipped in Blitz Survival Games',
                              type: 'object',
                              properties: {
                                aura: {
                                  description: 'Currently equipped aura cosmetic',
                                  type: 'string',
                                },
                                taunt: {
                                  description: 'Currently equipped taunt effect',
                                  type: 'string',
                                },
                                victory_dance: {
                                  description: 'Currently equipped victory dance effect',
                                  type: 'string',
                                },
                                finisher: {
                                  description: 'Currently equipped finisher effect',
                                  type: 'string',
                                },
                              },
                            },
                            settings: {
                              description: 'Current settings in Blitz Survival Games',
                              type: 'object',
                              properties: {
                                default_kit: {
                                  description: 'Current kit selected as default in Blitz Survival Games',
                                  type: 'string',
                                },
                                auto_armor: {
                                  description: 'Is auto armor enabled',
                                  type: 'boolean',
                                },
                              },
                            },
                            inventories: {
                              description: 'Currently configured kit inventories',
                              type: 'object',
                            },
                          },
                        },
                        CvC: {
                          description: 'Player stats in Cops vs Crims',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Cops vs Crims',
                              type: 'integer',
                            },
                            deaths: {
                              description: 'Total deaths in Cops vs Crims',
                              type: 'integer',
                            },
                            kills: {
                              description: 'Total kills in Cops vs Crims',
                              type: 'integer',
                            },
                            kd: {
                              description: 'Current kill/death ratio in Cops vs Crims',
                              type: 'number',
                            },
                            wins: {
                              description: 'Total wins in Cops vs Crims',
                              type: 'integer',
                            },
                            cop_kills: {
                              description: 'Total cops killed',
                              type: 'integer',
                            },
                            criminal_kills: {
                              description: 'Total criminals killed',
                              type: 'integer',
                            },
                            weekly_kills: {
                              description: 'Current weekly kills',
                              type: 'integer',
                            },
                            monthly_kills: {
                              description: 'Current monthly kills',
                              type: 'integer',
                            },
                            bombs_planted: {
                              description: 'Total bombs planted as Criminal',
                              type: 'integer',
                            },
                            bombs_defused: {
                              description: 'Total bombs defused as Cop',
                              type: 'integer',
                            },
                            grenade_kills: {
                              description: 'Total kills with a grenade',
                              type: 'integer',
                            },
                            headshot_kills: {
                              description: 'Total headshot kills',
                              type: 'integer',
                            },
                            round_wins: {
                              description: 'Total individual round wins',
                              type: 'integer',
                            },
                            selected_lobby_prefix: {
                              description: 'Currently selected nametag prefix in the Cops vs Crims lobby',
                              type: 'string',
                            },
                            shots_fired: {
                              description: 'Total shots fired',
                              type: 'integer',
                            },
                            show_lobby_prefix: {
                              description: 'Whether the lobby nametag prefix is currently enabled',
                              type: 'boolean',
                            },
                            map_wins: {
                              description: 'Current wins on specific maps',
                              type: 'object',
                              properties: {
                                alleyway: {
                                  description: 'Current wins on the Alleyway map',
                                  type: 'integer',
                                },
                                atomic: {
                                  description: 'Current wins on the Atomic map',
                                  type: 'integer',
                                },
                                carrier: {
                                  description: 'Current wins on the Carrier map',
                                  type: 'integer',
                                },
                                melon_factory: {
                                  description: 'Current wins on the Melon Factory map',
                                  type: 'integer',
                                },
                                overgrown: {
                                  description: 'Current wins on the Overgrown map',
                                  type: 'integer',
                                },
                                reserve: {
                                  description: 'Current wins on the Reserve map',
                                  type: 'integer',
                                },
                                sandstorm: {
                                  description: 'Current wins on the Sandstorm map',
                                  type: 'integer',
                                },
                                temple: {
                                  description: 'Current wins on the Temple map',
                                  type: 'integer',
                                },
                              },
                              deathmatch: {
                                description: 'Current player stats in CvC Deathmatch',
                                type: 'object',
                                properties: {
                                  kills: {
                                    description: 'Total kills in CvC Deathmatch',
                                    type: 'integer',
                                  },
                                  deaths: {
                                    description: 'Total deaths in CvC Deathmatch',
                                    type: 'integer',
                                  },
                                  kd: {
                                    description: 'Current kill/death ratio in CvC Deathmatch',
                                    type: 'number',
                                  },
                                  wins: {
                                    description: 'Total wins in CvC Deathmatch',
                                    type: 'integer',
                                  },
                                  cop_kills: {
                                    description: 'Total cops killed in CvC Deathmatch',
                                    type: 'integer',
                                  },
                                  criminal_kills: {
                                    description: 'Total criminals killed in CvC Deathmatch',
                                    type: 'integer',
                                  },
                                },
                              },
                              perks: {
                                description: 'Currently purchased perks and upgrades for Cops vs Crims',
                                type: 'object',
                                properties: {
                                  player: {
                                    description: 'Character upgrades',
                                    type: 'object',
                                    properties: {
                                      body_armor_cost: {
                                        description: 'Current progression of Body Armor Cost upgrade',
                                        type: 'integer',
                                      },
                                      bounty_hunter: {
                                        description: 'Current progression of Bounty Hunter upgrade',
                                        type: 'integer',
                                      },
                                      pocket_change: {
                                        description: 'Current progression of Pocket Change upgrade',
                                        type: 'integer',
                                      },
                                      strength_training: {
                                        description: 'Current progression of Strength Training upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                  carbine: {
                                    description: 'Carbine Specialization upgrades',
                                    type: 'object',
                                    properties: {
                                      cost_reduction: {
                                        description: 'Current progression of the Carbine\'s Cost Reduction upgrade',
                                        type: 'integer',
                                      },
                                      damage_increase: {
                                        description: 'Current progression of the Carbine\'s Damage Increase upgrade',
                                        type: 'integer',
                                      },
                                      recoil_reduction: {
                                        description: 'Current progression of the Carbine\'s Recoil Reduction upgrade',
                                        type: 'integer',
                                      },
                                      reload_speed_reduction: {
                                        description: 'Current progression of the Carbine\'s Reload Speed Reduction upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                  knife: {
                                    description: 'Knife Specialization upgrades',
                                    type: 'object',
                                    properties: {
                                      attack_delay: {
                                        description: 'Current progression of the Knife\'s Attack Delay upgrade',
                                        type: 'integer',
                                      },
                                      damage_increase: {
                                        description: 'Current progression of the Knife\'s Damage Increase upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                  magnum: {
                                    description: 'Magnum Specialization upgrades',
                                    type: 'object',
                                    properties: {
                                      cost_reduction: {
                                        description: 'Current progression of the Magnum\'s Cost Reduction upgrade',
                                        type: 'integer',
                                      },
                                      damage_increase: {
                                        description: 'Current progression of the Magnum\'s Damage Increase upgrade',
                                        type: 'integer',
                                      },
                                      recoil_reduction: {
                                        description: 'Current progression of the Magnum\'s Recoil Reduction upgrade',
                                        type: 'integer',
                                      },
                                      reload_speed_reduction: {
                                        description: 'Current progression of the Magnum\'s Reload Speed Reduction upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                  pistol: {
                                    description: 'Pistol Specialization upgrades',
                                    type: 'object',
                                    properties: {
                                      damage_increase: {
                                        description: 'Current progression of the Pistol\'s Damage Increase upgrade',
                                        type: 'integer',
                                      },
                                      recoil_reduction: {
                                        description: 'Current progression of the Pistol\'s Recoil Reduction upgrade',
                                        type: 'integer',
                                      },
                                      reload_speed_reduction: {
                                        description: 'Current progression of the Pistol\'s Reload Speed Reduction upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                  rifle: {
                                    description: 'Rifle Specialization upgrades',
                                    type: 'object',
                                    properties: {
                                      cost_reduction: {
                                        description: 'Current progression of the Rifle\'s Cost Reduction upgrade',
                                        type: 'integer',
                                      },
                                      damage_increase: {
                                        description: 'Current progression of the Rifle\'s Damage Increase upgrade',
                                        type: 'integer',
                                      },
                                      recoil_reduction: {
                                        description: 'Current progression of the Rifle\'s Recoil Reduction upgrade',
                                        type: 'integer',
                                      },
                                      reload_speed_reduction: {
                                        description: 'Current progression of the Rifle\'s Reload Speed Reduction upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                  shotgun: {
                                    description: 'Shotgun Specialization upgrades',
                                    type: 'object',
                                    properties: {
                                      cost_reduction: {
                                        description: 'Current progression of the Shotgun\'s Cost Reduction upgrade',
                                        type: 'integer',
                                      },
                                      damage_increase: {
                                        description: 'Current progression of the Shotgun\'s Damage Increase upgrade',
                                        type: 'integer',
                                      },
                                      recoil_reduction: {
                                        description: 'Current progression of the Shotgun\'s Recoil Reduction upgrade',
                                        type: 'integer',
                                      },
                                      reload_speed_reduction: {
                                        description: 'Current progression of the Shotgun\'s Reload Speed Reduction upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                  smg: {
                                    description: 'SMG Specialization upgrades',
                                    type: 'object',
                                    properties: {
                                      cost_reduction: {
                                        description: 'Current progression of the SMG\'s Cost Reduction upgrade',
                                        type: 'integer',
                                      },
                                      damage_increase: {
                                        description: 'Current progression of the SMG\'s Damage Increase upgrade',
                                        type: 'integer',
                                      },
                                      recoil_reduction: {
                                        description: 'Current progression of the SMG\'s Recoil Reduction upgrade',
                                        type: 'integer',
                                      },
                                      reload_speed_reduction: {
                                        description: 'Current progression of the SMG\'s Reload Speed Reduction upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                  sniper: {
                                    description: 'Sniper Specialization upgrades',
                                    type: 'object',
                                    properties: {
                                      charge_bonus: {
                                        description: 'Current progression of the Sniper\'s Target Acquire upgrade',
                                        type: 'integer',
                                      },
                                      cost_reduction: {
                                        description: 'Current progression of the Sniper\'s Cost Reduction upgrade',
                                        type: 'integer',
                                      },
                                      damage_increase: {
                                        description: 'Current progression of the Sniper\'s Damage Increase upgrade',
                                        type: 'integer',
                                      },
                                      reload_speed_reduction: {
                                        description: 'Current progression of the Sniper\'s Reload Speed Reduction upgrade',
                                        type: 'integer',
                                      },
                                    },
                                  },
                                },
                              },
                              selected_cosmetics: {
                                description: 'Currently selected cosmetic appearance for each weapon type',
                                type: 'object',
                                properties: {
                                  carbine: {
                                    description: 'Currently selected Carbine cosmetic',
                                    type: 'string',
                                  },
                                  knife: {
                                    description: 'Currently selected Knife cosmetic',
                                    type: 'string',
                                  },
                                  magnum: {
                                    description: 'Currently selected Magnum cosmetic',
                                    type: 'string',
                                  },
                                  pistol: {
                                    description: 'Currently selected Pistol cosmetic',
                                    type: 'string',
                                  },
                                  rifle: {
                                    description: 'Currently selected Rifle cosmetic',
                                    type: 'string',
                                  },
                                  shotgun: {
                                    description: 'Currently selected Shotgun cosmetic',
                                    type: 'string',
                                  },
                                  smg: {
                                    description: 'Currently selected SMG cosmetic',
                                    type: 'string',
                                  },
                                },
                              },
                            },
                          },
                        },
                        MurderMystery: {
                          description: 'Player stats in Murder Mystery',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Murder Mystery',
                              type: 'integer',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/players/:player',
        func: (req, res) => {
          getPlayer(req, res, (err, player) => {
            if (err) {
              return res.status(err.status).json({ error: err.message });
            }
            delete player.achievements;
            delete player.quests;
            return res.json(player);
          });
        },
      },
    },
    '/players/{playerName}/achievements': {
      get: {
        tags: [
          'player',
        ],
        summary: 'In-depth achievement stats',
        description: 'Returns player achievement stats',
        parameters: [
          playerNameParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    achievement_points: {
                      type: 'integer',
                      description: 'Total achievement points',
                    },
                    game: {
                      type: 'object',
                      properties: {
                        one_time: {
                          type: 'array',
                          items: {
                            description: 'Achievement name',
                            type: 'string',
                          },
                        },
                        tiered: {
                          type: 'array',
                          items: {
                            description: 'Achievement name',
                            type: 'integer',
                          },
                        },
                        completed: {
                          description: 'Total achievements completed in the game',
                          type: 'integer',
                        },
                        completed_tiered: {
                          description: 'Total tiered achievements completed in the game. Each tier counts as a completion',
                          type: 'integer',
                        },
                        completed_one_time: {
                          description: 'Total one time achievements completed in the game',
                          type: 'integer',
                        },
                        points: {
                          description: 'Total achievement points in the game',
                          type: 'integer',
                        },
                        points_tiered: {
                          description: 'Total achievement points from tiered achievements in the game',
                          type: 'integer',
                        },
                        points_one_time: {
                          description: 'Total achievement points from one time achievements in the game',
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/players/:player/achievements',
        func: (req, res) => {
          getPlayer(req, res, (err, player) => {
            if (err) {
              return res.status(err.status).json({ error: err.message });
            }
            return res.json(player.achievements);
          });
        },
      },
    },
    '/players/{playerName}/quests': {
      get: {
        tags: [
          'player',
        ],
        summary: 'In-depth quest data',
        description: 'Returns player quest completions',
        parameters: [
          playerNameParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    quests_completed: {
                      type: 'integer',
                      description: 'Total quests completed',
                    },
                    challenges_completed: {
                      type: 'integer',
                      description: 'Total challenges completed',
                    },
                    completions: {
                      type: 'object',
                      properties: {
                        game: {
                          type: 'array',
                          items: {
                            description: 'UNIX date',
                            type: 'integer',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/players/:player/quests',
        func: (req, res) => {
          getPlayer(req, res, (err, player) => {
            if (err) {
              return res.status(err.status).json({ error: err.message });
            }
            return res.json(player.quests);
          });
        },
      },
    },
    /*
    '/profile/{playerName}': {
      get: {
        tags: [
          'player',
        ],
        summary: 'Get basic player info',
        description: 'Returns player stats',
        parameters: [
          playerNameParam,
          },
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    uuid: {
                      description: 'Player uuid',
                      type: 'string',
                    },
                    username: {
                      description: 'Player username',
                      type: 'string',
                    },
                    first_login: {
                      description: 'First login date',
                      type: 'string',
                    },
                    level: {
                      description: 'Player level',
                      type: 'number',
                    },
                    achievement_points: {
                      description: 'Total achievement points',
                      type: 'integer',
                    },
                    karma: {
                      type: 'integer',
                    },
                    rank_formatted: {
                      description: 'Formatted rank string',
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    */
    '/guilds/{playerName}': {
      get: {
        tags: [
          'guild',
        ],
        summary: 'Get guild stats by user\'s username or uuid',
        parameters: [
          playerNameParam, populatePlayersParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      description: 'Guild\'s name',
                      type: 'string',
                    },
                    id: {
                      description: 'Guild id used in hypixel backend',
                      type: 'string',
                    },
                    created: {
                      description: 'Guild creation date',
                      type: 'string',
                    },
                    tag: {
                      description: 'Guild tag',
                      type: 'string',
                    },
                    tag_color: {
                      description: 'Formatting code for the guild tag',
                      type: 'string',
                    },
                    legacy_ranking: {
                      description: 'Ranking in the number of guild coins owned in the legacy guild system',
                      type: 'integer',
                    },
                    exp: {
                      description: 'Total guild xp',
                      type: 'integer',
                    },
                    level: {
                      description: 'Guild level',
                      type: 'number',
                    },
                    exp_by_game: {
                      description: 'Guild EXP earned in each minigame',
                      type: 'integer',
                    },
                    description: {
                      description: 'Guild description',
                      type: 'string',
                    },
                    preferred_games: {
                      description: 'Array containing the guild\'s preferred games',
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    ranks: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                          },
                          permissions: {
                            type: 'array',
                            items: {
                              type: 'number',
                            },
                          },
                          default: {
                            type: 'boolean',
                          },
                          tag: {
                            type: 'string',
                          },
                          created: {
                            type: 'integer',
                          },
                          priority: {
                            type: 'integer',
                          },
                        },
                      },
                    },
                    members: {
                      description: 'Array of players on the guild',
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          uuid: {
                            description: 'Player UUID',
                            type: 'string',
                          },
                          rank: {
                            description: 'Player rank in the guild',
                            type: 'string',
                          },
                          joined: {
                            description: 'Member join date',
                            type: 'integer',
                          },
                          quest_participation: {
                            description: 'How many much the member has contributed to guild quests',
                            type: 'integer',
                          },
                          muted_till: {
                            description: 'Date the member is muted until',
                            type: 'integer',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/guilds/:player',
        func: (req, res) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              return res.status(404).json({ error: err });
            }
            buildGuild(uuid, (err, guild) => {
              if (err) {
                return res.status(404).json({ error: err });
              }
              if (req.query.populatePlayers !== undefined) {
                populatePlayers(guild.members, (players) => {
                  guild.members = players;
                  return res.json(guild);
                });
              } else {
                return res.json(guild);
              }
            });
          });
        },
      },
    },
    '/sessions/{playerName}': {
      get: {
        tags: [
          'session',
        ],
        summary: 'Get guild stats by user\'s username or uuid',
        parameters: [
          playerNameParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    game: {
                      description: 'Minigame in standard format',
                      type: 'string',
                    },
                    server: {
                      description: 'Player\'s current server, e.g. mini103M',
                      type: 'string',
                    },
                    players: {
                      description: 'Array of players on the same server',
                      type: 'array',
                      items: {
                        description: 'Player uuid',
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/sessions/:player',
        func: (req, res, cb) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              cb();
            }
            buildSession(uuid, (err, session) => {
              if (err) {
                cb();
              }
              return res.json(session);
            });
          });
        },
      },
    },
    /*
      '/friends/{playerName}': {
        get: {
          tags: [
            'friends',
          ],
          summary: 'Get player\'s friends by user\'s username or uuid',
          parameters: [
            playerNameParam,
            },
          ],
          responses: {
            200: {
              description: 'successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        uuid: {
                          description: 'Friend\'s uuid',
                          type: 'string',
                        },
                        sent_by: {
                          description: 'UUID of the player who sent the friend request',
                          type: 'string',
                        },
                        started: {
                          description: 'Date the friendship started',
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      */
    '/leaderboards': {
      get: {
        tags: [
          'leaderboards',
        ],
        summary: 'Allows query of dynamic leaderboards',
        description: 'Returns player or guild leaderboards',
        parameters: [
          typeParam, columnParam, sortByParam, filterParam, limitParam, significantParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {

                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/leaderboards',
        func: (req, res, cb) => {
          leaderboards(req.query, (error, lb) => {
            if (error) {
              return cb(res.status(400).json({ error }));
            }
            return res.json(lb);
          });
        },
      },
    },
    '/boosters': {
      get: {
        tags: [
          'boosters',
        ],
        summary: 'Get list of network boosters',
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    game: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          uuid: {
                            description: 'UUID of booster owner',
                            type: 'string',
                          },
                          multiplier: {
                            description: 'Booster coin multiplier',
                            type: 'number',
                          },
                          activated: {
                            description: 'UNIX timestamp of activation date',
                            type: 'integer',
                          },
                          originalLength: {
                            description: 'Original duration in seconds',
                            type: 'integer',
                          },
                          length: {
                            description: 'Current length in seconds',
                            type: 'integer',
                          },
                          active: {
                            description: 'Whether the booster is currently active',
                            type: 'boolean',
                          },
                          stacked: {
                            description: 'Array of players that have stacked a booster on the same slot',
                            type: 'array',
                            items: {
                              description: 'Player uuid',
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/boosters',
        func: (req, res) => {
          buildBoosters((err, boosters) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            return res.json(boosters);
          });
        },
      },
    },
    '/boosters/{game}': {
      get: {
        tags: [
          'boosters',
        ],
        summary: 'Get boosters for a specified game',
        parameters: [
          gameNameParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      uuid: {
                        description: 'UUID of booster owner',
                        type: 'string',
                      },
                      multiplier: {
                        description: 'Booster coin multiplier',
                        type: 'number',
                      },
                      activated: {
                        description: 'UNIX timestamp of activation date',
                        type: 'integer',
                      },
                      originalLength: {
                        description: 'Original duration in seconds',
                        type: 'integer',
                      },
                      length: {
                        description: 'Current length in seconds',
                        type: 'integer',
                      },
                      active: {
                        description: 'Whether the booster is currently active',
                        type: 'boolean',
                      },
                      stacked: {
                        description: 'Array of players that have stacked a booster on the same slot',
                        type: 'array',
                        items: {
                          description: 'Player uuid',
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/boosters/:game',
        func: (req, res) => {
          const { game } = req.params;
          buildBoosters((err, boosters) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            if (!Object.hasOwnProperty.call(boosters.boosters, game)) {
              return res.status(400).json({ error: 'Invalid minigame name!' });
            }
            return res.json(boosters.boosters[game]);
          });
        },
      },
    },
    '/bans': {
      get: {
        tags: [
          'bans',
        ],
        description: 'Get watchdog and staff bans',
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    watchdog: {
                      type: 'object',
                      properties: {
                        last_minute: {
                          description: 'Watchdog\'s bans in the last minute',
                          type: 'integer',
                        },
                        daily: {
                          description: 'Watchdog bans in the last day',
                          type: 'integer',
                        },
                        total: {
                          description: 'Total Watchdog bans, ever',
                          type: 'integer',
                        },
                      },
                    },
                    staff: {
                      type: 'object',
                      properties: {
                        daily: {
                          description: 'Staff bans in the last day',
                          type: 'integer',
                        },
                        total: {
                          description: 'Total staff bans, ever',
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/bans',
        func: (req, res) => {
          buildBans((err, bans) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            return res.json(bans);
          });
        },
      },
    },
  },
};
module.exports = spec;
