import { expect, test } from 'vitest'
import { getLatestRating, getUserName, getFormat, getRatingsForFormat, getFormats } from './user-stats-parser.js'
import { UserStats } from './api.js';

test('empty returns 1000', () => {
  expect(getLatestRating([])).toBe("1000");
})

test('single rating returns the rating', () => {
  expect(getLatestRating([{ elo: 1500, time: 0 }])).toBe("1500");
})

test('multiple ratings returns the last rating', () => {
  expect(getLatestRating([
    { elo: 1500, time: 0 },
    { elo: 1600, time: 1 },
    { elo: 1700, time: 2 },
  ])).toBe("1700");
})

test('getUserName returns the username', () => {
  const userStats: UserStats = { userid: "foo", username: "bar", formats: {} };
  expect(getUserName(userStats)).toBe("bar");
})

test('getUserName returns empty string for undefined', () => {
  expect(getUserName(undefined)).toBe("");
})

test('getFormat returns the format', () => {
  expect(getFormat("gen8ou")).toBe("gen8ou");
})

test('getFormat returns empty string for undefined', () => {
  expect(getFormat(undefined)).toBe("");
})

test('getRatingsForFormat returns empty array for undefined userStats', () => {
  expect(getRatingsForFormat(undefined, "gen8ou")).toEqual([]);
})

test('getRatingsForFormat returns empty array for undefined format', () => {
  expect(getRatingsForFormat({ userid: "foo", username: "bar", formats: {} }, undefined)).toEqual([]);
})

test('getRatingsForFormat returns empty array for missing format', () => {
  expect(getRatingsForFormat({ userid: "foo", username: "bar", formats: {} }, "gen8ou")).toEqual([]);
})

test('getRatingsForFormat returns ratings for format', () => {
  const userStats: UserStats = {
    userid: "foo",
    username: "bar",
    formats: {
      "gen8ou": [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
      ],
    },
  };
  expect(getRatingsForFormat(userStats, "gen8ou")).toEqual([
    { elo: 1500, time: 0 },
    { elo: 1600, time: 1 },
    { elo: 1700, time: 2 },
  ]);
})

test('getFormats returns empty array for undefined userStats', () => {
  expect(getFormats(undefined)).toEqual([]);
})

test('getFormats returns list of formats', () => {
  const userStats: UserStats = {
    userid: "foo",
    username: "bar",
    formats: {
      "gen8ou": [],
      "gen8ubers": [],
      "gen8uu": [],
    },
  };
  expect(getFormats(userStats)).toEqual(["gen8ou", "gen8ubers", "gen8uu"]);
})

test('getFormats returns sorted list of formats', () => {
  const userStats: UserStats = {
    userid: "foo",
    username: "bar",
    formats: {
      "gen8uu": [],
      "gen8ubers": [],
      "gen8ou": [],
    },
  };
  expect(getFormats(userStats)).toEqual(["gen8ou", "gen8ubers", "gen8uu"]);
})