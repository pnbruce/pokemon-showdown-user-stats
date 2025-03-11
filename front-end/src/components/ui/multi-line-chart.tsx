import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { UserStats, Rating} from "@/lib/api"

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
import { log } from "console";


const getStatsForFormat = (userStats: UserStats, format: string, setFormat: (username: string) => void) => {
    try {
        return userStats.formats[format];
    } catch (error) {
        console.error("Error fetching stats for format", error);
        return [];
    }
};

const getStatsForRandomBattle = (userStats: UserStats) => {
    try {
        return userStats.formats.gen9randombattle;
    } catch (error) {
        console.error("Error fetching random battle stats", error);
        const empty: Rating[] = [];
        return empty;
    }
};

const ratings = (userStats: UserStats, format: string, setFormat: (username: string) => void) => {
    console.log(userStats);
    const data = getStatsForFormat(userStats, format, setFormat);
    console.log(data);
    if (!Array.isArray(data)) {
        return [];
    }

    const entries = data.map((rating: Rating) => {
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

export const MultiLineChart = ({ username, data, format, setFormat, isMobile }: {
    username: string
    data: UserStats
    format: string
    setFormat: (username: string) => void
    isMobile: boolean
}) => {

    return (
        <Card>
            <CardHeader>
                <CardTitle>{username} {format} Elo</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={ratings(data, format, setFormat)}
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
