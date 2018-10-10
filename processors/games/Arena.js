/* eslint-disable camelcase */
/*
 * Arena Brawl
 */

const {
  getRatio,
} = require('../../util/utility');

module.exports = ({
  active_rune,
  coins = 0,
  coins_spent = 0,
  combatTracker = 0,
  damage_1v1 = 0,
  damage_2v2 = 0,
  damage_4v4 = 0,
  deaths_1v1 = 0,
  deaths_2v2 = 0,
  deaths_4v4 = 0,
  games_1v1 = 0,
  games_2v2 = 0,
  games_4v4 = 0,
  hat,
  healed_1v1 = 0,
  healed_2v2 = 0,
  healed_4v4 = 0,
  keys = 0,
  kills_1v1 = 0,
  kills_2v2 = 0,
  kills_4v4 = 0,
  losses_1v1 = 0,
  losses_2v2 = 0,
  losses_4v4 = 0,
  lvl_cooldown = 1,
  lvl_damage = 1,
  lvl_energy = 1,
  lvl_health = 1,
  magical_chest = 0,
  offensive,
  packages,
  penalty = 0,
  rune_level_damage = 1,
  rune_level_energy = 1,
  rune_level_slowing = 1,
  rune_level_speed = 1,
  selected_sword,
  support,
  ultimate,
  utility,
  win_streaks_1v1 = 0,
  win_streaks_2v2 = 0,
  win_streaks_4v4 = 0,
  wins_1v1 = 0,
  wins_2v2 = 0,
  wins_4v4 = 0,
}) => ({
  coins,
  coins_spent,
  hat,
  penalty,
  magical_chest,
  keys,
  selected_sword,
  active_rune,
  skills: {
    offensive,
    support,
    utility,
    ultimate,
  },
  combat_levels: {
    melee: lvl_damage && lvl_damage + 1,
    health: lvl_health && lvl_health + 1,
    energy: lvl_energy && lvl_energy + 1,
    cooldown: lvl_cooldown && lvl_cooldown + 1,
  },
  rune_levels: {
    damage: rune_level_damage && rune_level_damage + 1,
    energy: rune_level_energy && rune_level_energy + 1,
    slowing: rune_level_slowing && rune_level_slowing + 1,
    speed: rune_level_speed && rune_level_speed + 1,
  },
  gamemodes: {
    one_v_one: {
      damage: damage_1v1,
      kills: kills_1v1,
      deaths: deaths_1v1,
      losses: losses_1v1,
      wins: wins_1v1,
      win_streaks: win_streaks_1v1,
      games: games_1v1,
      healed: healed_1v1,
      kd: getRatio(kills_1v1, deaths_1v1),
      win_loss: getRatio(wins_1v1, losses_1v1),
    },
    two_v_two: {
      damage: damage_2v2,
      kills: kills_2v2,
      deaths: deaths_2v2,
      losses: losses_2v2,
      wins: wins_2v2,
      win_streaks: win_streaks_2v2,
      games: games_2v2,
      healed: healed_2v2,
      kd: getRatio(kills_2v2, deaths_2v2),
      win_loss: getRatio(wins_2v2, losses_2v2),
    },
    four_v_four: {
      damage: damage_4v4,
      kills: kills_4v4,
      deaths: deaths_4v4,
      losses: losses_4v4,
      wins: wins_4v4,
      win_streaks: win_streaks_4v4,
      games: games_4v4,
      healed: healed_4v4,
      kd: getRatio(kills_4v4, deaths_4v4),
      win_loss: getRatio(wins_4v4, losses_4v4),
    },
  },
  combat_tracker: combatTracker,
  packages,
});
