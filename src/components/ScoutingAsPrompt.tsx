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

const dummyPlayerList: Player[] = [
  {
      name: "Haaland",
      summary: "Erling Haaland stands out for his exceptional physicality and clinical finishing, utilizing his robust frame and speed to overpower defenders and excel in various attacking systems. Despite his prowess, further development in playmaking could enhance his all-around game and elevate his status as one of the top forwards in the world.",
      tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560",
      img: "https://img.a.transfermarkt.technology/portrait/header/418560-1709108116.png?lm=1"
  },
  {
      name: "Thomas Müller",
      summary: "Thomas Müller excels with his exceptional spatial awareness and intelligent movement, consistently creating scoring opportunities; however, his one-on-one finishing could be further refined.",
      tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560",
      img: "https://img.a.transfermarkt.technology/portrait/header/58358-1683890647.jpg?lm=1"

  },
  {
      name: "Martin Fenin",
      summary: "Martin Fenin is known for his sharp instincts in the box and ability to make timely runs, but consistency in performance across different levels of play has been a challenge.",
      tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560",
      img: "https://img.a.transfermarkt.technology/portrait/header/21021-1438247989.jpg?lm=1"

  },
  {
      name: "Luka Jovic",
      summary: "Luka Jovic showcases strong finishing skills and the ability to hold up play effectively, though his impact can vary significantly when not in optimal form.",
      tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560",
      img: "https://img.a.transfermarkt.technology/portrait/header/257462-1657519856.jpg?lm=1"

  },
  {
      name: "Andre Silva",
      summary: "Andre Silva excels in aerial duels and possesses a keen sense for goal, although his mobility and pace are sometimes insufficient against faster defensive lines.",
      tmLink: "A",
      img: "https://img.a.transfermarkt.technology/portrait/header/198008-1663686224.jpg?lm=11"

  }
]

export type PlayerAPIResponse = {
  player_id: number;
  report_summary: string;
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

    const convertToPlayerList = (data: PlayerAPIResponse[]) => {
      let players: Player[] = []
      for(const element of data) {
        const player: Player = {
          img: "https://img.a.transfermarkt.technology/portrait/big/257462-1657519856.jpg?lm=1",
          tmLink: "https://www.transfermarkt.de/spieler/profil/spieler/" + element.player_id,
          summary: element.report_summary,
          name: "platzhalter-name"

        }
        players.push(player)
      }

      console.log(players)
       return players
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
      console.log("starting request against backend")
      const query = values.prompt
      const response = await api.post("scout-prompt", {query})
      console.log(response)

      let convertedPlayers = convertToPlayerList(response.data.response.list)
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
