import React, { useState, useRef } from "react";
import { fetchSimilarPlayers, fetchNameAndImage } from "../api";
import { Network, DataSet, Options } from "vis-network/standalone";
import "vis-network/styles/vis-network.css";
import { Button } from "@/components/ui/button";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getAllPlayersWithNames } from "@/api";

interface PlayerNode {
  id: string;
  label: string;
  image: string;
  group: string;
  title: string;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

interface LabelValue {
  value: string;
  label: string;
}

const PlayerNetwork: React.FC = () => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [playerDataLabelAndValue, setPlayerDataLabelAndValue] = useState<LabelValue[]>([]);

  const networkContainerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesRef = useRef<DataSet<PlayerNode>>(new DataSet());
  const edgesRef = useRef<DataSet<Edge>>(new DataSet());

  const options: Options = {
    nodes: {
      borderWidth: 5,
      size: 50,
      color: {
        border: "#2B7CE9",
        background: "#97C2FC",
        highlight: {
          border: "#2B7CE9",
          background: "#D2E5FF",
        },
        hover: {
          border: "#2B7CE9",
          background: "#D2E5FF",
        },
      },
      font: {
        color: "black",
        size: 20,
        face: "arial",
        align: "center",
      },
      shape: "circularImage",
    },
    edges: {
      color: "#cccccc",
      width: 2,
      hoverWidth: 3,
      selectionWidth: 3,
    },
    interaction: {
      hover: true,
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -3000,
        springLength: 200,
        springConstant: 0.04,
      },
    },
  };

  // Fetch players on component mount
  React.useEffect(() => {
    const fetchPlayerIdWithNames = async () => {
      const response = await getAllPlayersWithNames();
      const playersList = response.data;
      const shortPlayers = playersList.slice(0, 100);

      const playerLabelValue = shortPlayers.map((player: { id: number; name: string }) => ({
        value: player.id.toString(),
        label: player.name,
      }));

      setPlayerDataLabelAndValue(playerLabelValue);
    };

    fetchPlayerIdWithNames();
  }, []);

  const loadPlayerData = async (playerId: string) => {
    try {
      nodesRef.current.clear(); // Clear previous nodes
      edgesRef.current.clear(); // Clear previous edges

      const playerInfo = await fetchNameAndImage(parseInt(playerId, 10));
      const similarPlayers = await fetchSimilarPlayers(parseInt(playerId, 10));

      if (!playerInfo || !similarPlayers.length) {
        console.error("No player info or similar players found.");
        return;
      }

      const centralNode: PlayerNode = {
        id: playerId,
        label: playerInfo.name,
        image: playerInfo.imageURL,
        group: "central",
        title: "Above average height, agile and fast. The player has a good level of speed endurance, he is able to maintain a pace throughout the game. Level of technical skills is acceptable, nothing special.  When he receives the ball on the side of the pitch, he is able, through link-up play or individually, to get in behind the opposing team defense into spaces where he can make a cross.",
      };

      nodesRef.current.add(centralNode);

      const similarPlayerNodes = await Promise.all(
        similarPlayers.map(async (player: { player_transfermarkt_id: string }) => {
          const similarPlayerInfo = await fetchNameAndImage(parseInt(player.player_transfermarkt_id, 10));
          return {
            id: player.player_transfermarkt_id,
            label: similarPlayerInfo.name,
            image: similarPlayerInfo.imageURL || "https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1",
            group: "similar",
          };
        })
      );

      nodesRef.current.add(similarPlayerNodes.filter((node) => !nodesRef.current.get(node.id)));

      edgesRef.current.add(
        similarPlayers.map((player: { player_transfermarkt_id: any; distance: any }) => ({
          from: playerId,
          to: player.player_transfermarkt_id,
          weight: player.distance,
        }))
      );

      if (!networkRef.current) {
        const network = new Network(networkContainerRef.current!, { nodes: nodesRef.current, edges: edgesRef.current }, options);
        networkRef.current = network;

        network.on("click", function (params) {
          if (params.nodes.length > 0) {
            const clickedPlayerId = params.nodes[0];
            expandNetwork(clickedPlayerId);
          }
        });
      } else {
        networkRef.current.setData({ nodes: nodesRef.current, edges: edgesRef.current });
      }
    } catch (error) {
      console.error("Error loading player data:", error);
    }
  };

  const expandNetwork = async (playerId: string) => {
    try {
      const playerInfo = await fetchNameAndImage(parseInt(playerId, 10));
      const similarPlayers = await fetchSimilarPlayers(parseInt(playerId, 10));

      if (!playerInfo || !similarPlayers.length) {
        console.error("No player info or similar players found.");
        return;
      }

      const similarPlayerNodes = await Promise.all(
        similarPlayers.map(async (player: { player_transfermarkt_id: string }) => {
          const similarPlayerInfo = await fetchNameAndImage(parseInt(player.player_transfermarkt_id, 10));
          return {
            id: player.player_transfermarkt_id,
            label: similarPlayerInfo.name,
            image: similarPlayerInfo.imageURL || "https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1",
            group: "similar",
          };
        })
      );

      nodesRef.current.add(similarPlayerNodes.filter((node) => !nodesRef.current.get(node.id)));

      const newEdges = similarPlayers.map((player: { player_transfermarkt_id: string; distance: number }) => ({
        from: playerId,
        to: player.player_transfermarkt_id,
        weight: player.distance,
      }));

      const filteredEdges = newEdges.filter((edge: { from: any; to: any }) => {
        const existingEdge = edgesRef.current.get({
          filter: (item: { from: any; to: any }) => item.from === edge.from && item.to === edge.to,
        });
        return existingEdge.length === 0; // Only add if no matching edge exists
      });

      edgesRef.current.add(filteredEdges);

      networkRef.current?.setData({ nodes: nodesRef.current, edges: edgesRef.current });
    } catch (error) {
      console.error("Error expanding network:", error);
    }
  };

  return (
    <div>
      <div style={{ padding: "10px" }}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
              {value ? playerDataLabelAndValue.find((player) => player.value === value)?.label : "Select player..."}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command shouldFilter>
              <CommandInput placeholder="Search player..." className="h-9" />
              <CommandList>
                <CommandEmpty>No player found.</CommandEmpty>
                <CommandGroup>
                  {playerDataLabelAndValue.map((player) => (
                    <CommandItem
                      key={player.value}
                      value={player.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                        setPlayerId(currentValue);
                      }}
                    >
                      {player.label}
                      <CheckIcon className={cn("ml-auto h-4 w-4", value === player.value ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          className="ml-4"
          onClick={() => {
            if (playerId) {
              loadPlayerData(playerId);
            }
          }}
        >
          Load Network
        </Button>
      </div>
      <div ref={networkContainerRef} style={{ height: "600px" }} />
    </div>
  );
};

export default PlayerNetwork;
