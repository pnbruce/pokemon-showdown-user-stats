import { Line } from "recharts"

export function line() {
    return (
        <Line
        dataKey="the_brucey"
        type="monotone"
        stroke="var(--chart-2)"
        strokeWidth={2}
        dot={false}
        />
    )
}