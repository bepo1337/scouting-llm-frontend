import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type Player = {
    name: string;
    tmLink: string;
    summary: string;
    img: string;
}

type PlayerListType = {
    playerList: Player[]
}


export default function PlayerList({playerList}: PlayerListType) {
    const listItems = playerList.map(player => {
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
