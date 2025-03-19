import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Rating } from "@/lib/api"
import { convertToHumanReadableDates, getLatestRating } from "@/lib/user-stats-parser"

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
// import { Button } from "./button"


const chartConfig = {
} satisfies ChartConfig

export const MultiLineChart = ({ username, ratings, format, isMobile }: {
    username: string
    ratings: Rating[]
    format: string
    isMobile: boolean
}) => {

    // TODO:
    // get the current time
    // track state for which time domain is selected (1 day, 1 week, 1 month, 1 year, all time)
    // assoicate time offset for each time domain
    // exclude values from outside the time offset
    // on selection of one of the buttons, update the state.
    // the button for the corresponding domain will become colored differently after being clicked
    // based on the domain selected.

    const human_readable_data = convertToHumanReadableDates(ratings);
    return (
        <Card>
            <CardHeader>
                <CardTitle>{username}</CardTitle>
                <CardTitle>{format}</CardTitle>
                <CardTitle>{getLatestRating(ratings)}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={human_readable_data}
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
                {/* <Button type="button">1D</Button>
                <Button type="button">1W</Button>
                <Button type="button">1M</Button>
                <Button type="button">1Y</Button>
                <Button type="button">All Time</Button> */}
            </CardContent>
        </Card>
    )
}
