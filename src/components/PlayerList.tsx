import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type Player = {
    name: string;
    tmLink: string;
    summary: string;
}

const dummyPlayerList: Player[] = [
    {
        name: "Haaland",
        summary: "Good scoring ability",
        tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560"
    },
    {
        name: "Messi",
        summary: "Good scoring ability",
        tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560"
    },
    {
        name: "Fenin",
        summary: "Good scoring ability",
        tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560"
    },
    {
        name: "Jovic",
        summary: "Good scoring ability",
        tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560"
    },
    {
        name: "Andre Silva",
        summary: "Good scoring ability",
        tmLink: "https://www.transfermarkt.de/erling-haaland/profil/spieler/418560"
    }
]

export default function PlayerList() {
    const listItems = dummyPlayerList.map(player => {
       return <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>{player.name}</AccordionTrigger>
                <AccordionContent>
                    {player.summary}
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
