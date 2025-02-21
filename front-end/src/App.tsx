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
  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Line Chart</h1>
      </header>
      <MultiLineChart username='the_brucey'/>
      <ProfileForm/>
    </div>
  );
}

export default App
