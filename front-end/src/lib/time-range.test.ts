import { expect, test } from 'vitest'
import { Rating } from "./api";
import { applyTimeRange, Range, rangeToSeconds } from "./time-range.js";

test('applyTimeRange returns empty array for empty ratings', () => {
    const ratings: Rating[] = [];
    const timeRange = Range.Day;
    const result = applyTimeRange(ratings, timeRange, 100);
    expect(result).toEqual([]);
});

test('applyTimeRange returns empty array for all time range', () => {
    const ratings: Rating[] = [];
    const timeRange = Range.All;
    const result = applyTimeRange(ratings, timeRange, 100);
    expect(result).toEqual([]);
});

test('applyTimeRange returns all ratings for all time range', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ];
    const timeRange = Range.All;
    const result = applyTimeRange(ratings, timeRange, 100);
    expect(result).toEqual(ratings);
});

test('applyTimeRange returns ratings within time range', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ];
    const timeRange = Range.Day;
    const result = applyTimeRange(ratings, timeRange, 100);
    expect(result).toEqual([
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ]);
});


test('applyTimeRange returns ratings within time range (2)', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ];
    const timeRange = Range.Week;
    const result = applyTimeRange(ratings, timeRange, 100);
    expect(result).toEqual([
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ]);
});


test('applyTimeRange returns ratings within time range (3)', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ];
    const timeRange = Range.Month;
    const result = applyTimeRange(ratings, timeRange, 100);
    expect(result).toEqual([
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ]);
});


test('applyTimeRange returns ratings within time range (4)', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ];
    const timeRange = Range.Year;
    const result = applyTimeRange(ratings, timeRange, 100);
    expect(result).toEqual([
        { elo: 1500, time: 0 },
        { elo: 1600, time: 1 },
        { elo: 1700, time: 2 },
    ]);
});


test('applyTimeRange returns ratings within time range (5)', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ];
    const timeRange = Range.Day;
    const result = applyTimeRange(ratings, timeRange, rangeToSeconds(timeRange) + 100);
    expect(result).toEqual([
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ]);
});

test('applyTimeRange returns ratings within time range (6)', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ];
    const timeRange = Range.Week;
    const result = applyTimeRange(ratings, timeRange, rangeToSeconds(timeRange) + 100);
    expect(result).toEqual([
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ]);
});

test('applyTimeRange returns ratings within time range (7)', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ];
    const timeRange = Range.Month;
    const result = applyTimeRange(ratings, timeRange, rangeToSeconds(timeRange) + 100);
    expect(result).toEqual([
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ]);
});

test('applyTimeRange returns ratings within time range (8)', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ];
    const timeRange = Range.Year;
    const result = applyTimeRange(ratings, timeRange, rangeToSeconds(timeRange) + 100);
    expect(result).toEqual([
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ]);
});

test('applyTimeRange returns ratings within time range (9)', () => {
    const ratings: Rating[] = [
        { elo: 1500, time: 0 },
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ];
    const timeRange = Range.Year;
    const result = applyTimeRange(ratings, timeRange, rangeToSeconds(timeRange) + 100);
    expect(result).toEqual([
        { elo: 1600, time: 100},
        { elo: 1700, time: 150 },
    ]);
});

