import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { UserStats, Rating } from "@/lib/api"

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

const randomsRatings = (data: UserStats | null) => {
    if (data === null) {
        return [];
    }

    const randomsRatings: Rating[] = data?.formats.gen9randombattle || [];

    const entries = randomsRatings.map((rating: Rating) => {
        var timestamp = rating.time;
        var date = new Date(timestamp * 1000);

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        var dateStr = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        return {
            time: dateStr,
            elo: Math.round(rating.elo),
        };
    });

    return entries;
};

const chartConfig = {
    bhahn: {
        label: "bhahn",
        color: "hsl(var(--chart-1))",
    },
    the_brucey: {
        label: "the_brucey",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export const MultiLineChart = ({ username, data }: {
    username: string,
    data: UserStats | null
}) => {

    return (
        <Card>
            <CardHeader>
                <CardTitle>{username} Elo</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={randomsRatings(data)}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <YAxis domain={[1000, 'auto']} />
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
                        <Line
                            dataKey="the_brucey"
                            type="monotone"
                            stroke="var(--chart-2)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
