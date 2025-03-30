import axios, { AxiosError } from "axios";
import { toID } from "./user-stats-parser";

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
    const id = toID(username);
    const uri = `${API_BASE_URL}/user-stats/${id}`;
    const response = await axios.get<UserStats>(uri);
    if (response.status !== 200) {
        console.error(`Failed to fetch user stats: ${response.status}, ${response.statusText}`);
        throw new Error(`Failed to fetch user stats: ${response.status}, 
            ${response.statusText}`);
    }
    return response.data;
};

export const addUser = async (username: string): Promise<UserStats> => {
    const id = toID(username);
    try {
        const response = await axios.put<UserStats>(`${API_BASE_URL}/user-stats/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error updating user stats:", error);
        throw error;
    }
};