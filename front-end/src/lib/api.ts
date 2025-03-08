import axios from "axios";

export interface Rating {
    time: number;
    elo: number;
}

export interface Formats {
    [format: string]: Rating[];
}

export interface UserStats {
    username: string;
    userid: string;
    formats: Formats;
}

const API_BASE_URL = "https://pokemonshowdownuserstats.com";

export const getUserStats = async (username: string): Promise<UserStats> => {
    const uri = `${API_BASE_URL}/user-stats/${username}`;
    try {
        console.log(`Fetching user stats: ${uri}`);
        const response = await axios.get<UserStats>(uri);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch user stats: ${response.status}, 
            ${response.statusText}`);
        }
        return response.data;
    } catch (error) {
        console.error(`Error fetching user stats, adding user`, error);
        return addUser(username);
    }
};

export const addUser = async (username: string): Promise<UserStats> => {
    try {
        const response = await axios.put<UserStats>(`${API_BASE_URL}/user-stats/${username}`);
        return response.data;
    } catch (error) {
        console.error("Error updating user stats:", error);
        throw error;
    }
};