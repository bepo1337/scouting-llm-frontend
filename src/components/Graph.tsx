import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { fetchSimilarPlayers, fetchNameAndImage, getPlayerSummary } from "../api"; // added getPlayerSummary import
import { Network, DataSet, Options } from "vis-network/standalone";
import "vis-network/styles/vis-network.css";
import { Button } from "@/components/ui/button";
import { getAllPlayersWithNames } from "@/api";
import ClipLoader from "react-spinners/ClipLoader";

interface PlayerNode {
  id: string;
  label: string;
  image: string;
  group: string;
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
  const [playerDataLabelAndValue, setPlayerDataLabelAndValue] = useState<LabelValue[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LabelValue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playerSummary, setPlayerSummary] = useState<string | null>(null); // new state for player summary
  const [playerName, setPlayerName] = useState<string | null>(null); // new state for player's name in the summary

  const networkContainerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesRef = useRef<DataSet<PlayerNode>>(new DataSet());
  const edgesRef = useRef<DataSet<Edge>>(new DataSet());

  const options: Options = {
    width: "100%",
    height: "100%",
    nodes: {
      borderWidth: 2,
      size: 30,
      color: {
        border: "#000000",
        background: "#000000",
        highlight: {
          border: "#000000",
          background: "#000000",
        },
        hover: {
          border: "#000000",
          background: "#000000",
        },
      },
      font: {
        color: "#000000",
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

  useEffect(() => {
    const fetchPlayerIdWithNames = async () => {
      const response = await getAllPlayersWithNames();
      const playersList = response.data;

      const playerLabelValue = playersList.map((player: { id: number; name: string }) => ({
        value: player.id.toString(),
        label: player.name,
      }));

      setPlayerDataLabelAndValue(playerLabelValue);
    };

    fetchPlayerIdWithNames();
  }, []);

  const loadPlayerData = async (playerId: string) => {
    setIsLoading(true);
    try {
      nodesRef.current.clear();
      edgesRef.current.clear();

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
        networkRef.current.setOptions(options);

        // Single-click event to display player summary
        network.on("click", function (params) {
          if (params.nodes.length > 0) {
            const clickedPlayerId = params.nodes[0];
            handlePlayerClick(clickedPlayerId); // Show the summary on single click
          }
        });

        // Double-click event to expand network
        network.on("doubleClick", function (params) {
          if (params.nodes.length > 0) {
            const clickedPlayerId = params.nodes[0];
            expandNetwork(clickedPlayerId); // Expand network on double click
          }
        });
      } else {
        networkRef.current.setData({ nodes: nodesRef.current, edges: edgesRef.current });
        networkRef.current.setOptions(options);
      }
    } catch (error) {
      console.error("Error loading player data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerClick = async (playerId: string) => {
    setIsLoading(true);
    try {
      const summary = await getPlayerSummary(parseInt(playerId, 10));
      const playerInfo = await fetchNameAndImage(parseInt(playerId, 10)); // Fetch the player's name for the summary

      setPlayerSummary(summary);
      setPlayerName(playerInfo.name); // Set the player name in state
    } catch (error) {
      console.error("Error fetching player summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const expandNetwork = async (playerId: string) => {
    setIsLoading(true);
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
        return existingEdge.length === 0;
      });

      edgesRef.current.add(filteredEdges);

      networkRef.current?.setData({ nodes: nodesRef.current, edges: edgesRef.current });
      networkRef.current?.setOptions(options);
    } catch (error) {
      console.error("Error expanding network:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      {/* Main container with two sections */}
      <div className="w-full flex justify-between p-8 items-start">  {/* Ensure top alignment with 'items-start' */}
        
        {/* Section 1: Left Sidebar */}
        <div className="w-1/3 pr-8 flex flex-col space-y-4">  {/* Using 'space-y-4' for consistent spacing between items */}
          <h2 className="text-2xl font-semibold">Select Player</h2>
          <div className="flex items-center space-x-4"> {/* Flex container for Select and Button */}
            {/* Replace Popover with react-select */}
            <Select
              options={playerDataLabelAndValue}
              value={selectedPlayer}
              onChange={(selectedOption) => {
                setSelectedPlayer(selectedOption);
                setPlayerId(selectedOption?.value || null);
              }}
              placeholder="Select player..."
              isClearable
              className="w-[200px]"
            />
            
            {/* Load button to the right of the Select */}
            <Button
              onClick={() => {
                if (playerId) {
                  loadPlayerData(playerId);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load Network"}
            </Button>
          </div>
          
          {/* Loading animation */}
          {isLoading && (
            <div className="flex justify-center pt-4">
              <ClipLoader size={35} color="#2B7CE9" loading={isLoading} />
            </div>
          )}

          {/* Player Summary */}
          {playerSummary && (
            <div className="mt-4 p-4 border rounded shadow">
              <h3 className="text-lg font-semibold">
                Player Summary {playerName && `: ${playerName}`}
              </h3>
              <p>{playerSummary}</p>
            </div>
          )}
        </div>
  
        {/* Section 2: Right Main Content Area */}
        <div className="w-2/3 border-l-2 pl-8 flex flex-col space-y-4">  {/* Consistent padding and top alignment with 'space-y-4' */}
          <h2 className="text-2xl font-semibold">Player Network</h2>
          {/* Network visualization area */}
          <div ref={networkContainerRef} style={{ height: "600px", border: "1px solid #ddd" }}>
            {/* Placeholder for the network visualization */}
            <p>Network will be displayed here once loaded.</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PlayerNetwork;
