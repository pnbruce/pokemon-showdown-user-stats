import './App.css'
import { MultiLineChart } from "@/components/ui/multi-line-chart"
import { useState, useEffect } from "react"
import { UserStats } from "@/lib/api"
import { getRatingsForFormat, getLatestRating, getUserName, getFormat, formatRatings, getFormats} from './lib/user-stats-parser'
import { tryGetUsernameFromStorage, tryGetFormatFromStorage, updateUserStats } from './lib/defaults'
import { FormatForm } from './components/format-form'
import { UsernameForm } from './components/username-form'
import { AddDialog } from './components/add-user-dialog'
import { NotRegisteredDialog } from './components/user-not-registered-dialog'
import { Range, applyTimeRange } from './lib/time-range'

function App() {
  const [useDefault, setUseDefault] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>();
  const [format, setFormat] = useState<string>();
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [notRegisteredDialog, setNotRegisteredDialog] = useState(false);
  const [enteredUsername, setEnteredUsername] = useState<string>("");
  const [timeRange, setTimeRange] = useState<Range>(Range.All);

  useEffect(() => {
    if (useDefault) {
      const fetchDefaultUser = async () => {
        const fallbackDefaultUsername = "MichaelderBeste2";
        const username = tryGetUsernameFromStorage(localStorage, fallbackDefaultUsername)
        const fallbackDefaultFormat = "gen9randombattle"
        const defaultfrmt = tryGetFormatFromStorage(localStorage, fallbackDefaultFormat)
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

  const username = getUserName(userStats);
  const currentFormat = getFormat(format);
  const ratings = getRatingsForFormat(userStats, format);
  console.log("Ratings: ", ratings);
  console.log("timeRange: ", timeRange);
  console.log("now: ", Date.now());
  const filteredRatings = applyTimeRange(ratings, timeRange, Math.floor(Date.now() / 1000));
  const formattedRatings = formatRatings(filteredRatings);
  const formats = getFormats(userStats);
  const lastRating = getLatestRating(ratings);

  // TODO: derive list of formats from userstats

  // TODO: make sure that the graph and UI components do not fall off the screen. Enforce some max
  // height. 

  return (
    <div className="App">
      <AddDialog addUserDialog={addUserDialog} setAddUserDialog={setAddUserDialog} setUserStats={setUserStats} format={currentFormat} setFormat={setFormat} enteredUsername={enteredUsername}/>
      <NotRegisteredDialog notRegisteredDialog={notRegisteredDialog} setNotRegisteredDialog={setNotRegisteredDialog} enteredUsername={enteredUsername}/>
      <div className='App-header'>
        <h1 className="text-left text-2xl">Pokémon Showdown User Stats</h1>
      </div>
      {
        (isMobile) ?
          <div className="App-chart">
            <MultiLineChart username={username} ratings={formattedRatings} format={currentFormat} lastRating={lastRating} isMobile={isMobile} timeRange={timeRange} setTimeRange={setTimeRange}/>
            <div className="App-form">
              <UsernameForm setUserStats={setUserStats} setFormat={setFormat} currentFormat={currentFormat} setAddUserDialog={setAddUserDialog}  setEnteredUsername={setEnteredUsername} setNotRegisteredDialog={setNotRegisteredDialog}/>
              <FormatForm currentFormat={currentFormat} setFormat={setFormat} formats={formats} />
            </div>
          </div> :
          <div style={{ display: "grid", gridTemplateColumns: "4fr 1fr", gap: "10px" }}>
            <div className="App-chart">
              <MultiLineChart username={username} ratings={formattedRatings} format={currentFormat} lastRating={lastRating} isMobile={isMobile} timeRange={timeRange} setTimeRange={setTimeRange}/>
            </div>
            <div className="App-form">
              <UsernameForm setUserStats={setUserStats} setFormat={setFormat} currentFormat={currentFormat} setAddUserDialog={setAddUserDialog}  setEnteredUsername={setEnteredUsername} setNotRegisteredDialog={setNotRegisteredDialog}/>
              <FormatForm currentFormat={currentFormat} setFormat={setFormat} formats={formats} />
            </div>
          </div>
      }
    </div>
  );
}

export default App

