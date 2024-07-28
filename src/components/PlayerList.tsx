import { MouseEvent, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export type Player = {
    name: string;
    tmLink: string;
    summary: string;
    img: string;
}

type PlayerListType = {
    playerList: Player[]
}


export default function PlayerList({ playerList }: PlayerListType) {
    const [reactions, setReactions] = useState<{ [key: string]: string | null }>({});
  
    const handleReaction = (event: MouseEvent, tmLink: string, reactionType: string) => {
      event.preventDefault();
      setReactions((prevReactions) => ({
        ...prevReactions,
        [tmLink]: reactionType,
      }));
      
    };
  
    const listItems = playerList.map((player) => {
      const playerReaction = reactions[player.tmLink];
  
      return (
        <Accordion key={player.tmLink} type="single" collapsible>
          <AccordionItem value="item-1">
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
                  onClick={(event) => handleReaction(event, player.tmLink, 'up')}
                  className={`p-2 ${playerReaction === 'up' ? 'bg-green-500' : 'bg-white'}`}
                >
                  👍
                </button>
                <button
                  onClick={(event) => handleReaction(event, player.tmLink, 'neutral')}
                  className={`p-2 ${playerReaction === 'neutral' ? 'bg-yellow-500' : 'bg-white'}`}
                >
                  😐
                </button>
                <button
                  onClick={(event) => handleReaction(event, player.tmLink, 'down')}
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