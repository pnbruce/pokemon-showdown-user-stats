import './App.css'
import { MultiLineChart } from "@/components/ui/multi-line-chart"
import { useState, useEffect } from "react"
import { UserStats } from "@/lib/api"
import { getRatingsForFormat, getLatestRating} from './lib/user-stats-parser'
import { tryGetUsernameFromStorage, tryGetFormatFromStorage, updateUserStats } from './lib/defaults'
import { FormatForm } from './components/format-form'
import { UsernameForm } from './components/username-form'

function App() {
  const [useDefault, setUseDefault] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>();
  const [format, setFormat] = useState<string>();

  useEffect(() => {
    if (useDefault) {
      const fetchDefaultUser = async () => {
        const fallbackDefaultUsername = "MichaelderBeste2";
        const username = tryGetUsernameFromStorage(fallbackDefaultUsername)
        const fallbackDefaultFormat = "gen9randombattle"
        const defaultfrmt = tryGetFormatFromStorage(fallbackDefaultFormat)
        await updateUserStats(username, defaultfrmt, fallbackDefaultFormat, setUserStats, setFormat)
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
  const formats = (userStats === undefined) ? [] : Object.keys(userStats.formats).sort((a, b) => {
    return a.localeCompare(b);
  })

  // TODO: derive list of formats from userstats

  // TODO: make sure that the graph and UI components do not fall off the screen. Enforce some max
  // height. 

  const lastRating = getLatestRating(ratings);

  return (
    <div className="App">
      <div className='App-header'>
        <h1 className="text-left text-2xl">Pokémon Showdown User Stats</h1>
      </div>
      {
        (isMobile) ?
          <div className="App-chart">
            <MultiLineChart username={username} ratings={ratings} format={currentFormat} lastRating={lastRating} isMobile={isMobile} />
            <div className="App-form">
              <UsernameForm setUserStats={setUserStats} setFormat={setFormat}/>
              <FormatForm currentFormat={currentFormat} setFormat={setFormat} formats={formats} />
            </div>
          </div> :
          <div style={{ display: "grid", gridTemplateColumns: "4fr 1fr", gap: "10px" }}>
            <div className="App-chart">
              <MultiLineChart username={username} ratings={ratings} format={currentFormat} lastRating={lastRating} isMobile={isMobile} />
            </div>
            <div className="App-form">
              <UsernameForm setUserStats={setUserStats} setFormat={setFormat}/>
              <FormatForm currentFormat={currentFormat} setFormat={setFormat} formats={formats} />
            </div>
          </div>
      }
    </div>
  );
}

export default App

