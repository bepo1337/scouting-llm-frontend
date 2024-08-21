import { MouseEvent, useEffect, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { getOriginaLReports, sendReaction } from '@/api';

export type Player = {
    id: number;
    name: string;
    tmLink: string;
    summary: string;
    fineGrainedReports: string[];
    img: string;
}

type PlayerListProps = {
    playerListToParent: (playerId: number) => void;
    playerList: Player[];
    query: string;
}


export default function PlayerList({ playerListToParent, playerList, query }: PlayerListProps) {
    const [reactions, setReactions] = useState<{ [key: number]: string | null }>({});


    const getSummaryForPlayer = (id: number) => {
        for (const player of playerList) {
            if (player.id === id) {
                return player.summary;
            }
        }

        return "EMPTY_SUMMARY";
    }

    const handleReaction = (event: MouseEvent, id: number, reactionType: string) => {
        event.preventDefault();
        setReactions((prevReactions) => ({
            ...prevReactions,
            [id]: reactionType,
        }));
        // do api call for reaction
        const summaryOfPlayer = getSummaryForPlayer(id)
        sendReaction(query, id, summaryOfPlayer, reactionType)
        // send player id, summary, query?
        // later also the references, but for now just this?
    };

    const callCallbackFunc = (playerID: string) => {
        playerListToParent(Number(playerID))
    }

    const listItems = playerList.map((player) => {
        const playerReaction = reactions[player.id];

        return (
            <Accordion key={player.tmLink} type="single" collapsible onValueChange={callCallbackFunc}>
                <AccordionItem value={`${player.id}`}>
                    <div className="flex items-center space-x-4">
                        <img className="h-12 rounded-md" src={player.img} alt={player.name} />
                        <AccordionTrigger>{player.name}</AccordionTrigger>
                    </div>
                    <AccordionContent>
                        {player.summary}
                        <br />
                        <br />
                        <a href={player.tmLink} className="text-blue-500 hover:text-blue-800">Go to Transfermarkt profile</a>
                        <div className="mt-4 flex space-x-2">
                            <button
                                onClick={(event) => handleReaction(event, player.id, 'up')}
                                className={`p-2 ${playerReaction === 'up' ? 'bg-green-500' : 'bg-white'}`}
                            >
                                👍
                            </button>
                            <button
                                onClick={(event) => handleReaction(event, player.id, 'neutral')}
                                className={`p-2 ${playerReaction === 'neutral' ? 'bg-yellow-500' : 'bg-white'}`}
                            >
                                😐
                            </button>
                            <button
                                onClick={(event) => handleReaction(event, player.id, 'down')}
                                className={`p-2 ${playerReaction === 'down' ? 'bg-red-500' : 'bg-white'}`}
                            >
                                👎
                            </button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    });

    return <>{listItems}</>;
}