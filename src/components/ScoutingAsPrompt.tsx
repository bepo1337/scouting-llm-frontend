import { scoutPlayers } from "@/api"
import { Textarea } from "@/components/ui/textarea"
import { Positions } from "@/config/constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import PlayerList, { Player } from "./PlayerList"
import Skeleton from "./Skeleton"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const formSchema = z.object({
  prompt: z.string().min(2).max(1000),
  position: z.string().min(0).max(1000)
})

export default function Chat() {
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      position: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setPlayerList([])
    setIsLoading(true)
    const query = values.prompt
    const position = values.position
    let players = await scoutPlayers(query, position)
    setIsLoading(false)
    setPlayerList(players)
  }

  const positions = Object.keys(Positions).map((key) => (
    <SelectItem key={key} value={Positions[key as keyof typeof Positions]}>
      {Positions[key as keyof typeof Positions]}
    </SelectItem>
  ));


return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
        control={form.control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position (optional)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a position to search for..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {positions}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
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

      {<PlayerList playerList={playerList}></PlayerList>}
      {!isLoading && <Button type="submit" >Submit</Button>}
      {isLoading &&
        <>
          <Skeleton></Skeleton>
          <Button type="button" disabled>
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </Button>
        </>
      }
    </form>
  </Form>
)
}
