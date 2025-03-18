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

    const entries = ratings.map((rating: Rating) => {
        var timestamp = rating.time;
        var date = new Date(timestamp * 1000);

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();

        var dateStr = year + "-" + month + "-" + day + " " + hours + ":" + minutes;
        return {
            time: dateStr,
            elo: Math.round(rating.elo),
        };
    });

    return entries;
};