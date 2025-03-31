import axios from "axios";
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

interface UserProfile {
    username: string;
    userid: string;
    registertime: number;
    group: number;
    ratings: {
        [key: string]: RatingStats;
    };
}

interface RatingStats {
    elo: number;
    gxe: number;
    rpr: number;
    rprd: number;
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

export const pokemonShowdownGetUser = async (username: string): Promise<UserProfile> => {
    const id = toID(username);
    try {
        const response = await axios.get<UserProfile>(`https://pokemonshowdown.com/users/${id}.json`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user stats:", error);
        throw error;
    }
}