"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getUserStats, UserStats } from "@/lib/api"

const FormSchema = z.object({
    format: z.string(),
    username: z.string()
})

export function FormatForm({ setFormat, setUserStats, formats }: {
    setFormat: (format: string) => void,
    setUserStats: (data: UserStats) => void,
    formats: string[]
}) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            format: "",
            username: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const userStats: UserStats = await getUserStats(data.username);
            const formats = userStats.formats
            console.log(formats)
            console.log(userStats);
            setUserStats(userStats);
            localStorage.setItem("username", JSON.stringify(data.username));
        } catch (error) {
            console.error("Error fetching user stats:", error);
        }
        console.log("format form onSubmit: " + data.format);
        setFormat(data.format);
        localStorage.setItem("format", JSON.stringify(data.format));
    }

    const selectItems = formats.map(format =>
        <SelectItem value={format}>{format}</SelectItem>
    )

    // TODO: make the form select drop down opace
    // TODO: make the form select feild a constant width
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Format" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {selectItems}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}
