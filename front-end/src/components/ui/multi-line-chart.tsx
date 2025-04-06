import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Range } from '../../lib/time-range'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "./button"
// import { Button } from "./button"


const chartConfig = {
} satisfies ChartConfig

export const MultiLineChart = ({ username, ratings, format, lastRating, isMobile, timeRange, setTimeRange }: {
    username: string
    ratings: {
        time: string;
        elo: number;
    }[]
    format: string
    lastRating: string
    isMobile: boolean
    timeRange: Range
    setTimeRange: (value: Range) => void
}) => {

    // TODO:
    // get the current time
    // track state for which time domain is selected (1 day, 1 week, 1 month, 1 year, all time)
    // assoicate time offset for each time domain
    // exclude values from outside the time offset
    // on selection of one of the buttons, update the state.
    // the button for the corresponding domain will become colored differently after being clicked
    // based on the domain selected.
    return (
        <Card>
            <CardHeader>
                <CardTitle>{username}</CardTitle>
                <CardTitle>{format}</CardTitle>
                <CardTitle>{lastRating}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={ratings}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        {isMobile ? <YAxis domain={[1000, 'auto']} hide={true} /> :
                            <YAxis domain={[1000, 'auto']} />}
                        <XAxis
                            dataKey="time"
                            hide={true}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="elo"
                            type="linear"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
                <Button className={timeRange == Range.Day ? "text-[hsl(12_76%_61%)]" : ""} type="button">1D</Button>
                <Button className={timeRange == Range.Week ? "text-[hsl(12_76%_61%)]" : ""} type="button">1W</Button>
                <Button className={timeRange == Range.Month ? "text-[hsl(12_76%_61%)]" : ""} type="button">1M</Button>
                <Button className={timeRange == Range.Year ? "text-[hsl(12_76%_61%)]" : ""} type="button">1Y</Button>
                <Button className={timeRange == Range.All ? "text-[hsl(12_76%_61%)]" : ""} type="button">All Time</Button>
            </CardContent>
        </Card>
    )
}
