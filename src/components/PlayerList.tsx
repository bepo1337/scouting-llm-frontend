import { MouseEvent, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { sendReaction } from '@/api';

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


// Workaround to style the stored summary a presentable HTML
function formatStructuredSummary(summary: string): string {
    let newSummary = summary.replace(/:\*\*/g, ':').replace(/\*\*/g, "<br><br>").replace("<br><br>", "");

    newSummary = newSummary.replace(/- ([^\n\r]*)/g, '<li>$1</li>');
    newSummary = newSummary.replace(/General text about the player:/g, '<h3 style="font-size: 1em; font-weight: bold;">General:</h3>');
    newSummary = newSummary.replace(/Strengths:/g, '<br><h3 style="font-size: 1em; font-weight: bold;">Strenghts:</h3>');
    newSummary = newSummary.replace(/Weaknesses:/g, '<h3 style="font-size: 1em; font-weight: bold;">Weaknesses:</h3>');
    newSummary = newSummary.replace(/Physical Capabilities:/g, '<h3 style="font-size: 1em; font-weight: bold;">Physical Capabilities:</h3>');
    newSummary = newSummary.replace(/Offensive Capabilities:/g, '<h3 style="font-size: 1em; font-weight: bold;">Offensive Capabilities:</h3>');
    newSummary = newSummary.replace(/Defensive Capabilities:/g, '<h3 style="font-size: 1em; font-weight: bold;">Defensive Capabilities:</h3>');
    newSummary = newSummary.replace(/Other Attributions:/g, '<h3 style="font-size: 1em; font-weight: bold;">Other Attributions:</h3>');
    newSummary = newSummary.replace(/<br><br><h3/g, '<br><h3');

    return newSummary
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

    // sends reaction back to backend which will log it
    const handleReaction = (event: MouseEvent, id: number, reactionType: string) => {
        event.preventDefault();
        setReactions((prevReactions) => ({
            ...prevReactions,
            [id]: reactionType,
        }));
        // do api call for reaction
        const summaryOfPlayer = getSummaryForPlayer(id)
        sendReaction(query, id, summaryOfPlayer, reactionType)
    };

    const callCallbackFunc = (playerID: string) => {
        playerListToParent(Number(playerID))
    }

    const listItems = playerList.map((player) => {
        const playerReaction = reactions[player.id];
        const originalSummary = player.summary


        return (
            <Accordion key={player.tmLink} type="single" collapsible onValueChange={callCallbackFunc}>
                <AccordionItem value={`${player.id}`}>
                    <div className="flex items-center space-x-4">
                        <img className="h-12 rounded-md" src={player.img} alt={player.name} />
                        <AccordionTrigger>{player.name}</AccordionTrigger>
                    </div>
                    <AccordionContent>
                        <div dangerouslySetInnerHTML={{ __html: formatStructuredSummary(originalSummary) }} />
                        <br />
                        <br />
                        <a href={player.tmLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-800 flex">
                        Go to <img src="../../public/tm.png" alt="test" style={{ marginLeft: '5px', marginRight: '5px', height: '20px' }} /> profile 🔗
                        </a>
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