import { expect, test } from 'vitest'
import { getLatestRating } from './user-stats-parser.js'

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