import { UserStats, Rating } from "@/lib/api"

export const getRatingsForFormat = (userStats: UserStats, format: string) => {
    try {
        return userStats.formats[format];
    } catch (error) {
        console.error("Error fetching stats for format", error);
        return [];
    }
};

export const getLatestRating = (ratings: Rating[]) => {
    return ratings === undefined || ratings.length < 1 ? "1000" : `${Math.round(ratings[ratings.length - 1].elo)}`
}

export const convertToHumanReadableDates = (ratings: Rating[]) => {
    if (!Array.isArray(ratings)) {
        return [];
    }

    const entries = ratings.map((rating) => {
        const date = new Date(rating.time * 1000);
        const dateStr = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // 12-hour format
        }).format(date);
    
        return {
            time: dateStr,
            elo: Math.round(rating.elo)
        };
    });

    return entries;
};