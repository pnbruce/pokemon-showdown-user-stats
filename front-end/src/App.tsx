import './App.css'
import { MultiLineChart } from "@/components/ui/multi-line-chart"
import { type ChartConfig } from "@/components/ui/chart"
import { ProfileForm } from "@/components/input-form"


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

function App() {
  // chart in the middle and form on the right hand side
  return (
    <div className="App">
      <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: "10px" }}>

        <div className="App-chart">
          <MultiLineChart username='the_brucey'/>
        </div>
        <div className="App-form">
          <ProfileForm/>
        </div>
      </div>
    </div>
  );
}

export default App
