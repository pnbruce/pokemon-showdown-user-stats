import './App.css'
import { MultiLineChart } from "@/components/ui/multi-line-chart"
import { ProfileForm } from "@/components/input-form"
import { useState, useEffect } from "react";
import { UserStats, getUserStats } from "@/lib/api"


function App() {
  const [useDefault, setUseDefault] = useState(true);
  const [username, setUserName] = useState("");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [format] = useState("gen9randombattle");

  useEffect(() => {
    if (useDefault) {
      const fetchDefaultUser = async () => {
        const defaultUsername = "MichaelDerBeste2";
        setUserName(defaultUsername);
        const stats = await getUserStats(defaultUsername);
        setUserStats(stats);
        setUseDefault(false);
      };
      fetchDefaultUser();
    }
  }, [useDefault]);

  return (
    <div className="App">
      <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: "10px" }}>

        <div className="App-chart">
          <MultiLineChart username={username} data={userStats} format={format} />
        </div>
        <div className="App-form">
          <ProfileForm setUserName={setUserName} setUserStats={setUserStats} />
        </div>
      </div>
    </div>
  );
}

export default App
