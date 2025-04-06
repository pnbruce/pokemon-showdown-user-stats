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
import { TimeRangeButton } from "../time-range-button"


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
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ChartContainer>
                <TimeRangeButton timeRange={Range.Day} currentRange={timeRange} setTimeRange={setTimeRange}></TimeRangeButton>
                <TimeRangeButton timeRange={Range.Week} currentRange={timeRange} setTimeRange={setTimeRange}></TimeRangeButton>
                <TimeRangeButton timeRange={Range.Month} currentRange={timeRange} setTimeRange={setTimeRange}></TimeRangeButton>
                <TimeRangeButton timeRange={Range.Year} currentRange={timeRange} setTimeRange={setTimeRange}></TimeRangeButton>
                <TimeRangeButton timeRange={Range.All} currentRange={timeRange} setTimeRange={setTimeRange}></TimeRangeButton>
            </CardContent>
        </Card>
    )
}
