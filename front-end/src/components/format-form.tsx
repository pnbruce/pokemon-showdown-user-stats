"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
    format: z.string()
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
        console.log("format form onSubmit: " + data.format);
        if (data.format === "") {
            return;
        }
        setFormat(data.format);
        localStorage.setItem("format", JSON.stringify(data.format));
    }

    const selectItems = formats.map(format =>
        <SelectItem value={format} key={format}>{format}</SelectItem>
    )

    return (
        <Form {...form}>
            <form className="space-y-8">
                <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                form.handleSubmit(onSubmit)();
                            }} value={currentFormat}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                        <SelectValue placeholder={currentFormat} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white w-full truncate">
                                    {selectItems}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}
