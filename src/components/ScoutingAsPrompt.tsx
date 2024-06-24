import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import PlayerList, { Player } from "./PlayerList"
import { Button } from "./ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { BASE_URL } from "@/config/constants"
import axios from 'axios'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Link } from "react-router-dom"
import Skeleton from "./Skeleton"

export type PlayerAPIResponse = {
  player_id: number;
  report_summary: string;
}

type NameAndImage = {
  name: string;
  imageURL: string;
}
export default function Chat() {

  const api = axios.create({
    baseURL: BASE_URL
  })
  const [playerList, setPlayerList] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)


  const formSchema = z.object({
    prompt: z.string().min(2).max(1000),
    position: z.string().min(0).max(1000)
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      position: "",
    },
  })

  async function fetchNameAndImage(playerID: number): Promise<NameAndImage> {
    try {
      const response = await fetch("https://www.transfermarkt.de/api/get/appShortinfo/player?ids=" + playerID)
      if (!response.ok) {
        throw new Error("tm api response was not ok")
      }


      const data = await response.json()
      let playerData = data.player[0]
      const nameAndImage = {
        name: playerData.name,
        imageURL: playerData.image
      }

      return nameAndImage
    } catch (error) {
      console.error("error fetching TM api data")
      console.log(error)
      return { name: "unknown", imageURL: "https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1" }
    }
  }

  const convertToPlayerList = async (data: PlayerAPIResponse[]) => {
    let players: Player[] = []
    for (const element of data) {
      let name = ""
      let imageURL = ""

      await fetchNameAndImage(element.player_id).then(nameAndImage => {
        name = nameAndImage.name
        imageURL = nameAndImage.imageURL
      })

      const player: Player = {
        img: imageURL,
        tmLink: "https://www.transfermarkt.de/spieler/profil/spieler/" + element.player_id,
        summary: element.report_summary,
        name: name
      }

      players.push(player)
    }

    return players
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setPlayerList([])
    setIsLoading(true)
    const query = values.prompt
    const response = await api.post("scout-prompt", { query })

    let convertedPlayers = await convertToPlayerList(response.data.response.list)
    setIsLoading(false)
    setPlayerList(convertedPlayers)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position to search for..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                  <SelectItem value="centerback">Center Back</SelectItem>
                  <SelectItem value="leftcenterback">Left Center Back</SelectItem>
                  <SelectItem value="rightcenterback">Right Center Back</SelectItem>
                  <SelectItem value="leftback">Leftback</SelectItem>
                  <SelectItem value="rightwing">Right winger</SelectItem>
                  <SelectItem value="leftwing">Left winger</SelectItem>
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
