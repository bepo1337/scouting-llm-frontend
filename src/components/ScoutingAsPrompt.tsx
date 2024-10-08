import { scoutPlayers, getOriginaLReports } from "@/api"
import { Textarea } from "@/components/ui/textarea"
import { Positions } from "@/config/constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import PlayerList, { Player } from "./PlayerList"
import SkeletonsPlayerList from "./SkeletonPlayerList"
import { Button } from "./ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import OriginalReports from "./OriginalReports"

type OriginalReportsAndFineGrainedReport = {
  reports: string[];
  fineGrainedReport: string;
}


const formSchema = z.object({
  prompt: z.string().min(2).max(1000),
  position: z.string().min(0).max(1000),
  fineGrained: z.boolean(),
})

export default function Chat() {
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [originalReports, setOriginalReports] = useState<string[]>([])
  const [fineGrainedReportState, setFineGrainedReportState] = useState<string>("")
  const [playerToReports, setPlayerToReports] = useState<{ [key: number]: OriginalReportsAndFineGrainedReport }>({});



  // When the player list changes, we want to ge tthe original reports of those players to show them
  useEffect(() => {
    const fetchReports = async () => {
      const fetchedReports: { [key: number]: OriginalReportsAndFineGrainedReport } = {};
      for (const player of playerList) {
        const response = await getOriginaLReports(player.id)
        let reports = response.data
        let fineGrainedRep = ""
        if (player.fineGrainedReports.length > 0) {
          fineGrainedRep = player.fineGrainedReports[0]
        }

        const reportsWithFineGrainedRep : OriginalReportsAndFineGrainedReport = {
          reports: reports, 
          fineGrainedReport: fineGrainedRep 
        };    

        fetchedReports[player.id] = reportsWithFineGrainedRep
      }
      setPlayerToReports(fetchedReports);
    };
    fetchReports();
  }, [playerList]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      position: "",
      fineGrained: false,
    },
  })

  // send form (prompt, fine grained and position) back to the backend to get a list of players 
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

  // change the shown original reports
  const setPlayerAndReports = (playerID: number) => {
    console.log(playerID)
    if (playerID == 0) {
      setOriginalReports([])
      setFineGrainedReportState("")

    } else {
      setOriginalReports(playerToReports[playerID].reports)
      setFineGrainedReportState(playerToReports[playerID].fineGrainedReport)
    }
  }


  return (
    <div className="w-full flex justify-center ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-8 border-r-2 pr-6 flex">
          <div className="flex flex-col w-min space-y-7 !mt-0 border-r-2 pr-10">  
          <h2 className="text-2xl font font-medium">Optional parameters</h2>
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
                   Can limit the results because players that didn't play their main position won't be found.
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
            /></div>
          <div className="flex flex-col w-full space-y-7 !mt-0 pl-10 ">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Scouting Prompt</FormLabel>
                  <FormControl>
                    <Textarea className="h-64" placeholder="Player search prompt..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {<PlayerList playerListToParent={setPlayerAndReports} playerList={playerList} query={form.getValues().prompt}></PlayerList>}
            {!isLoading && <Button className="w-min" type="submit" >Scout</Button>}
            {isLoading &&
              <>
                <SkeletonsPlayerList></SkeletonsPlayerList>
                <Button  className="w-min" type="button" disabled>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </Button>
              </>
            }</div>
        </form>
      </Form>
    {/* hier ein prob weiter dur hreichen */}
      <div className="pl-8 w-1/3 self-start max-w-1/2 sticky top-0"> <OriginalReports reports={originalReports} fineGrainedReport={fineGrainedReportState} /></div> 

    </div>

  )
}
