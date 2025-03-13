"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getUserStats, UserStats } from "@/lib/api"

const formSchema = z.object({
    username: z.string(),
})

export function ProfileForm({ setUserName, setUserStats }: {
    setUserName: (username: string) => void,
    setUserStats: (data: UserStats) => void
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const userStats = await getUserStats(values.username);
            console.log(userStats);
            setUserStats(userStats);
            setUserName(values.username);
            localStorage.setItem("username", JSON.stringify(values.username));
        } catch (error) {
            console.error("Error fetching user stats:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Enter Username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}
