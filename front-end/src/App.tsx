import './App.css'
import { MultiLineChart } from "@/components/ui/multi-line-chart"
import { ProfileForm } from "@/components/input-form"
import { useState, useEffect } from "react";
import { UserStats, getUserStats } from "@/lib/api"



function App() {

  const defaultUserStats: UserStats = {
    username: "",
    formats: {
      gen9randombattle: []
    },
    userid: ""
  }
  const [useDefault, setUseDefault] = useState(true);

  const [username, setUserName] = useState(() => {
    try {
      console.log("getting username from local storage");
      const item = localStorage.getItem("username");
      return item ? JSON.parse(item) : "MichealDerBeste2";
    } catch (error) {
      console.warn("Error fetching username from local storage", error);
      return "MichealDerBeste2";
    }
  });
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats);
  const [format, setFormat] = useState("gen9randombattle");

  useEffect(() => {

    if (useDefault) {
      const fetchDefaultUser = async () => {
        console.log(`fetching default user: ${username}`);
        const stats = await getUserStats(username);
        setUserStats(stats);
        setUseDefault(false);
        localStorage.setItem("useDefault", JSON.stringify(false));
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

  return (
    <div className="App">
      {
        !(isMobile) ?
          <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: "10px" }}>
            <div className="App-chart">
              <MultiLineChart username={username} data={userStats} format={format} setFormat={setFormat} isMobile={isMobile} />
            </div>
            <div className="App-form">
              <ProfileForm setUserName={setUserName} setUserStats={setUserStats} />
            </div>
          </div> :
          <div className="App-chart">
              <MultiLineChart username={username} data={userStats} format={format} setFormat={setFormat} isMobile={isMobile} />
            <div className="App-form">
              <ProfileForm setUserName={setUserName} setUserStats={setUserStats} />
            </div>
          </div>
      }
    </div>
  );
}

export default App
