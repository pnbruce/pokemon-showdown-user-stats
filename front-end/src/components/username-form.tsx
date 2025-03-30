"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { set, useForm } from "react-hook-form"
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
import { AxiosError } from "axios"

const FormSchema = z.object({
    username: z.string()
})

export function UsernameForm({ setUserStats, setFormat, currentFormat, setAddUserDialog }: {
    setUserStats: (data: UserStats) => void,
    setFormat: (format: string | undefined) => void,
    currentFormat: string,
    setAddUserDialog: (value: boolean) => void,
}) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: ""
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            await updateUserStats(data.username, currentFormat, "gen9randombattle", setUserStats, setFormat);
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 404) {
                setAddUserDialog(true);
            } else {
                console.error("Error fetching user stats:", error);
            }
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
