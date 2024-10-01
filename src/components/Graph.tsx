import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { fetchSimilarPlayers, fetchNameAndImage, getPlayerSummary, comparePlayers} from "../api"; // added getPlayerSummary import
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
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [showHelp, setShowHelp] = useState(false);

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

        network.on("click", function (params) {
          if (params.edges.length > 0) {
            const clickedEdgeId = params.edges[0];
            handleEdgeClick(clickedEdgeId); // Handle edge click for comparison
          }
        });
        
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

  // Function to handle edge click and fetch comparison
  const handleEdgeClick = async (edgeId: string) => {
    const edge = edgesRef.current.get(edgeId);
    if (!edge) return;

    const { from, to } = edge; // Extract player IDs from edge
    setIsLoading(true);
    try {
      const comparisonPayload = {
        player_left: parseInt(from, 10),
        player_right: parseInt(to, 10),
        all: true, // You can adjust the criteria as needed
        offensive: false,
        defensive: false,
        strenghts: false,
        weaknesses: false,
        other: false,
        otherText: ""
      };

      const comparison = await comparePlayers(comparisonPayload);
      setComparisonResult(comparison); // Store the comparison result
    } catch (error) {
      console.error("Error fetching comparison:", error);
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

  const toggleHelp = () => setShowHelp(!showHelp);

  return (
    <div className="w-full flex justify-center relative">
      {/* Help Icon in the top-right corner */}
      <div
        className="absolute top-0 right-8 bg-gray-300 rounded-full w-10 h-10 flex justify-center items-center cursor-pointer"
        onClick={toggleHelp}
      >
        <span className="text-xl font-bold text-white">?</span>
      </div>

      {/* Help Popup */}
      {showHelp && (
        <div className="absolute top-14 right-10 bg-white border shadow-lg p-4 rounded-lg z-50">
          <h3 className="text-lg font-semibold">How to Use the Player Network</h3>
          <p>Select a player from the dropdown to load their network.</p>
          <p>Click on players in the network to view their summary.</p>
          <p>Double-click on a player to expand their network of similar players.</p>
        </div>
      )}
      
      {/* Main container with two sections */}
      <div className="w-full flex justify-between pt-0 p-8 items-start">
        
        {/* Section 1: Left Sidebar */}
        <div className="w-1/4 pr-8 flex flex-col space-y-4"> 
        <h2 className="text-2xl font-semibold">Select Player</h2>
        <div className="flex flex-col space-y-4 w-full">
          <Select
            options={playerDataLabelAndValue}
            value={selectedPlayer}
            onChange={(selectedOption) => {
              setSelectedPlayer(selectedOption);
              setPlayerId(selectedOption?.value || null);
            }}
            placeholder="Select player..."
            isClearable
            className="w-full"
          />

          {/* Load button full width */}
          <Button
            className="w-full"
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

          {comparisonResult && (
            <div className="mt-4 p-4 border rounded shadow">
              <h2 className="text-lg font-semibold">Player Comparison: {comparisonResult.player_left_name} vs {comparisonResult.player_right_name}</h2>
                <p>{JSON.parse(comparisonResult.comparison).general}</p>
            </div>
          )}
        </div>
  
        {/* Section 2: Right Main Content Area */}
        <div className="w-3/4 border-l-2 pl-8 flex flex-col space-y-4">  {/* Consistent padding and top alignment with 'space-y-4' */}
          <h2 className="text-2xl font-semibold">Player Network</h2>
          {/* Network visualization area */}
          <div
            ref={networkContainerRef}
            style={{
              height: "650px",
              border: "1px solid #ddd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "grey",
            }}
          >
            <p>Network will be displayed here once loaded.</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PlayerNetwork;
