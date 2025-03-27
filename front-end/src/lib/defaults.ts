import { UserStats, Formats, getUserStats } from "@/lib/api";

export const tryGetUsernameFromStorage = (storage: Storage, fallbackDefaultUsername: string) => {
  return getFromStorage(storage, fallbackDefaultUsername, "username");
};

export const tryGetFormatFromStorage = (storage: Storage, fallbackDefaultFormat: string) => {
  return getFromStorage(storage, fallbackDefaultFormat, "format");
};

const getFromStorage = (storage: Storage, defaultValue: string, key: string) => {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

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