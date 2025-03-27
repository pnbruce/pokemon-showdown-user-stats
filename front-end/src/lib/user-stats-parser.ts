import { UserStats, Rating } from "@/lib/api"

export const getRatingsForFormat = (userStats: UserStats | undefined, format: string | undefined) => {
    if (userStats === undefined || format === undefined || !(format in userStats.formats)) {
        return [];
    }
    return userStats.formats[format];
};

export const formatRatings = (ratings: Rating[]) => {
    if (!Array.isArray(ratings)) {
        return [];
    }

    const formattedRatings = ratings.map((rating) => {
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

    return formattedRatings;
}


export const getLatestRating = (ratings: Rating[]) => {
    return ratings.length < 1 ? "1000" : `${Math.round(ratings[ratings.length - 1].elo)}`
}

export const getUserName = (userStats: UserStats | undefined) => {
    return (userStats === undefined) ? "" : userStats.username;
}

export const getFormat = (format: string | undefined) => {
    return (format === undefined) ? "" : format;
}

export const getFormats = (userStats: UserStats | undefined) => {
    return (userStats === undefined) ? [] : Object.keys(userStats.formats).sort((a, b) => {
        return a.localeCompare(b);
    });
}