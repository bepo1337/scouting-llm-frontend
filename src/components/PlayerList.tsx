import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type Player = {
    name: string;
    tmLink: string;
    summary: string;
    img: string;
}

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

export default function PlayerList() {
    const listItems = dummyPlayerList.map(player => {
       return <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <div className='flex items-center space-x-4'>
                <AccordionTrigger>{player.name}</AccordionTrigger>
                    <img className="h-12 rounded-md" src={player.img}/>
                </div>
                <AccordionContent>
                    {player.summary}
                    <br></br>
                    <br></br>
                    <a href={player.tmLink} className="text-blue-500 hover:text-blue-800">Go to Transfermarkt profile</a>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    })

    return (
        <>
            {listItems}
        </>
    )
}
