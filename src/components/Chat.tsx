import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import PlayerList from "./PlayerList"
import { useState } from "react"

export default function Chat() {
    const [showResponse, setShowResponse] = useState(false)

    const formSchema = z.object({
        prompt: z.string().min(2).max(1000)
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
      setShowResponse(!showResponse)
    }

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scouting Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Player search prompt..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showResponse && <PlayerList></PlayerList>}
            <Button type="submit">Find next Messi now!</Button>
          </form>
        </Form>
      )
}
