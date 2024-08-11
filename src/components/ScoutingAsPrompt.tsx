import { scoutPlayers } from "@/api"
import { dummyPlayerList } from "@/dummydata"

import { Textarea } from "@/components/ui/textarea"
import { Positions } from "@/config/constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import PlayerList, { Player } from "./PlayerList"
import Skeleton from "./Skeleton"
import { Button } from "./ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"

const formSchema = z.object({
  prompt: z.string().min(2).max(1000),
  position: z.string().min(0).max(1000),
  fineGrained: z.boolean(),
})

export default function Chat() {
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      position: "",
      fineGrained: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setPlayerList([])
    setIsLoading(true)
    const query = values.prompt
    const position = values.position
    const fineGrained = values.fineGrained
    let players = await scoutPlayers(query, position, fineGrained)
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
          name="fineGrained"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-3/5 min-w-80">
              <div className="space-y-0.5">
                <FormLabel>Fine grained search</FormLabel>
                <FormDescription>
                  Search in single reports, not just in summaries of players to find rare attributions
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem className="w-3/5 min-w-80">
              <FormLabel>Position</FormLabel>
              <FormDescription>
                  Optional. Can limit the results because players that didn't play their main position won't be found. 
                </FormDescription>
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

        {<PlayerList playerList={playerList} query={form.getValues().prompt}></PlayerList>}
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
