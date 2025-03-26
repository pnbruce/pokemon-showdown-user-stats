import { UserStats, Formats, getUserStats } from "@/lib/api";

export const tryGetUsernameFromStorage = (fallbackDefaultUsername: string) => {
  return getFromStorage(fallbackDefaultUsername, "username");
}

export const tryGetFormatFromStorage = (fallbackDefaultFormat: string) => {
  return getFromStorage(fallbackDefaultFormat, "format");
}

const getFromStorage = (defualtValue: string, key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defualtValue;
  } catch (error) {
    return defualtValue;
  }
}

export async function updateUserStats(username: string, defaultFormat: string, fallbackFormat: string,
  setUserStats: (data: UserStats) => void,
  setFormat: (format: string | undefined) => void) {
  try {
    const stats = await getUserStats(username);
    setUserStats(stats);
    localStorage.setItem("username", JSON.stringify(username));
    if (!(Object.keys(stats.formats).length === 0)) {
      const format = getFormat(stats.formats, defaultFormat, fallbackFormat);
      setFormat(format);
      localStorage.setItem("format", JSON.stringify(format));
    } else {
      setFormat(undefined);
    }
  } catch (error) {
    console.error("error getting user stats:", error);
    return;
  }
}

export const getFormat = (formats: Formats, defaultFormat: string, fallbackFormat: string) => {
  const formatsArray = formatsToArray(formats);
  if (formatsArray.includes(defaultFormat)) {
    return defaultFormat;
  } else if (formatsArray.includes(fallbackFormat)) {
    return fallbackFormat;
  }
  return formatsArray[0];
}

const formatsToArray = (formats: Formats) => {
  return Object.keys(formats).sort((a, b) => {
    return a.localeCompare(b);
  })
}