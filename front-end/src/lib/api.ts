import axios, { AxiosError } from "axios";

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
        const response = await axios.get<UserStats>(uri);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch user stats: ${response.status}, 
                ${response.statusText}`);
        }
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
            console.warn(`User not in database: ${username} attempting to add user`);
            return addUser(username);
        }
        console.error("Error fetching user stats:", error);
        throw error;
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