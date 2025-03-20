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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const FormSchema = z.object({
    format: z.string(),
    username: z.string()
})

export function FormatForm({ currentFormat, setFormat, formats }: {
    currentFormat: string,
    setFormat: (format: string) => void,
    formats: string[]
}) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            format: currentFormat
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setFormat(data.format);
        console.log(`Setting format to ${data.format}`);
        localStorage.setItem("format", JSON.stringify(data.format));
    }

    const selectItems = formats.map(format =>
        <SelectItem value={format}>{format}</SelectItem>
    )
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={currentFormat === '' ? currentFormat : "Format"} />
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
