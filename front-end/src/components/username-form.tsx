"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { updateUserStats } from "@/lib/defaults"
import { UserStats } from "@/lib/api"

const FormSchema = z.object({
    username: z.string()
})

export function UsernameForm({ setUserStats, setFormat, currentFormat }: {
    setUserStats: (data: UserStats) => void,
    setFormat: (format: string | undefined) => void,
    currentFormat: string
}) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: ""
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            updateUserStats(data.username, currentFormat, "gen9randombattle", setUserStats, setFormat);
        } catch (error) {
            console.error("Error fetching user stats:", error);
        }
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-8">
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
            </form>
        </Form>
    )
}
