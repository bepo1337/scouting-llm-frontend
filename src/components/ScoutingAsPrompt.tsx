import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import PlayerList, { Player } from "./PlayerList"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { BASE_URL } from "@/config/constants"
import axios from 'axios'

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


  const formSchema = z.object({
    prompt: z.string().min(2).max(1000)
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
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
    console.log("starting request against backend")
    const query = values.prompt
    const response = await api.post("scout-prompt", { query })
    console.log(response)

    let convertedPlayers = await convertToPlayerList(response.data.response.list)
    setPlayerList(convertedPlayers)
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
        {<PlayerList playerList={playerList}></PlayerList>}
        <Button type="submit">Find next Messi now!</Button>
      </form>
    </Form>
  )
}
