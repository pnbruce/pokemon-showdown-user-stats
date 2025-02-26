import './App.css'
import { MultiLineChart } from "@/components/ui/multi-line-chart"
import { ProfileForm } from "@/components/input-form"
import { useState, useEffect } from "react";
import { getUserStats, UserStats} from "@/lib/api"


function App() {

  const [username, setUserName] = useState("");
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  return (
    <div className="App">
      <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: "10px" }}>

        <div className="App-chart">
          <MultiLineChart username={username} data={userStats}/>
        </div>
        <div className="App-form">
          <ProfileForm setUserName={setUserName} setUserStats={setUserStats} />
        </div>
      </div>
    </div>
  );
}

export default App
