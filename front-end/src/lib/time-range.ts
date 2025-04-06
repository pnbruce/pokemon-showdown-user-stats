import { Rating } from "./api";

export enum Range {
    Day = "1D",
    Week = "1W",
    Month = "1M",
    Year = "1Y",
    All = "All Time"
}

export function rangeToSeconds(range: Range): number {
    switch (range) {
        case Range.Day:
            return 86400;
        case Range.Week:
            return 604800;
        case Range.Month:
            return 2592000;
        case Range.Year:
            return 31536000;
        default:
            return Number.MAX_SAFE_INTEGER; // All time
    }
}

export function applyTimeRange(ratings : Rating[], timeRange: Range, currentTime: number): Rating[] {
    const timeOffset = rangeToSeconds(timeRange);
    const filteredRatings = ratings.filter((rating) => {
        const ratingTime = rating.time; // Convert to milliseconds
        return (currentTime - ratingTime) <= timeOffset;
    });
    return filteredRatings;
}