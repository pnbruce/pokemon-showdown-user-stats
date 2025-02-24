import './App.css'
import { MultiLineChart } from "@/components/ui/multi-line-chart"
import { ProfileForm } from "@/components/input-form"
import React from "react"




function App() {
  const [username, setUserName] = React.useState("the_brucey");

  // chart in the middle and form on the right hand side
  return (
    <div className="App">
      <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: "10px" }}>

        <div className="App-chart">
          <MultiLineChart username={username}/>
        </div>
        <div className="App-form">
          <ProfileForm setUserName={setUserName}/>
        </div>
      </div>
    </div>
  );
}

export default App
