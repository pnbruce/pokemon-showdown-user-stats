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


const chartConfig = {
} satisfies ChartConfig

export const MultiLineChart = ({ username, ratings, format, isMobile }: {
    username: string
    ratings: Rating[]
    format: string
    isMobile: boolean
}) => {
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
                        data={convertToHumanReadableDates(ratings)}
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
            </CardContent>
        </Card>
    )
}
