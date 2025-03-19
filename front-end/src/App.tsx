import './App.css'
import { MultiLineChart } from "@/components/ui/multi-line-chart"
import { FormatForm } from './components/username-format-form'
import { useState, useEffect } from "react"
import { UserStats, getUserStats } from "@/lib/api"
import { getRatingsForFormat } from './lib/user-stats-parser'


const defaultUsername = (fallbackDefaultUsername: string) => {
  try {
    const item = localStorage.getItem("username");
    return item ? JSON.parse(item) : fallbackDefaultUsername;
  } catch (error) {
    return fallbackDefaultUsername;
  }
}

const fallbackDefaultFormat = (userStats: UserStats, firstChoice: string) => {
  if (Object.keys(userStats.formats).length === 0) {
    return "";
  }
  if (Object.keys(userStats.formats).includes(firstChoice)) {
    return firstChoice;
  }
  return Object.keys(userStats.formats)[0];
}

const defaultFormat = (fallbackDefaultFormat: string) => {
  try {
    const item = localStorage.getItem("format");
    return item ? JSON.parse(item) : fallbackDefaultFormat;
  } catch (error) {
    return fallbackDefaultFormat;
  }
}

function App() {
  const [useDefault, setUseDefault] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>();
  const [format, setFormat] = useState<string>();

  useEffect(() => {
    if (useDefault) {
      const fetchDefaultUser = async () => {
        const fallbackDefaultUsername = "MichaelderBeste2";
        const username = defaultUsername(fallbackDefaultUsername);
        const stats = await getUserStats(username);
        setUserStats(stats);
        const firstChoiceFormat = "gen9randombattle";
        const fallbackDefault = fallbackDefaultFormat(stats, firstChoiceFormat);
        const format = defaultFormat(fallbackDefault);
        setFormat(format);
        setUseDefault(false);
      };
      fetchDefaultUser();
    }
  }, [useDefault]);

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  const username = (userStats === undefined) ? "" : userStats.username;
  const currentFormat = (format === undefined) ? "" : format;
  const ratings = (userStats === undefined) || (format === undefined) ? [] : getRatingsForFormat(userStats, format);

  // TODO: derive list of formats from userstats
  const formats = (userStats === undefined) ? [] : Object.keys(userStats.formats).sort((a, b) => {
    return a.localeCompare(b);
  })

  // TODO: make sure that the graph and UI components do not fall off the screen. Enforce some max
  // height. 

  return (
    <div className="App">
      <div className='App-header'>
        <h1 className="text-left text-2xl">Pokémon Showdown User Stats</h1>
      </div>
      {
        (isMobile) ?
          <div className="App-chart">
            <MultiLineChart username={username} ratings={ratings} format={currentFormat} isMobile={isMobile} />
            <div className="App-form">
              <FormatForm setFormat={setFormat} setUserStats={setUserStats} formats={formats} />
            </div>
          </div> :
          <div style={{ display: "grid", gridTemplateColumns: "4fr 1fr", gap: "10px" }}>
            <div className="App-chart">
              <MultiLineChart username={username} ratings={ratings} format={currentFormat} isMobile={isMobile} />
            </div>
            <div className="App-form">
              <FormatForm setFormat={setFormat} setUserStats={setUserStats} formats={formats} />
            </div>
          </div>
      }
    </div>
  );
}

export default App
