import React, { useState, useRef, useEffect } from "react";
import { fetchSimilarPlayers, fetchNameAndImage, getPlayerSummary, comparePlayers} from "../api";
import { Network, DataSet, Options } from "vis-network/standalone";
import "vis-network/styles/vis-network.css";
import { Button } from "@/components/ui/button";
import { getAllPlayersWithNames } from "@/api";
import AsyncSelect from "react-select/async";

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
  // State hooks for managing data
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerDataLabelAndValue, setPlayerDataLabelAndValue] = useState<LabelValue[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LabelValue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playerSummary, setPlayerSummary] = useState<string | null>(null); // new state for player summary
  const [playerName, setPlayerName] = useState<string | null>(null); // new state for player's name in the summary
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);  // State for physics toggle
  const [hasError, setHasError] = useState(false);

  // Refs for network and dataset manipulation
  const networkContainerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesRef = useRef<DataSet<PlayerNode>>(new DataSet());
  const edgesRef = useRef<DataSet<Edge>>(new DataSet());

  // Options for the network visualization
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
      enabled: physicsEnabled,
      barnesHut: {
        gravitationalConstant: -3000,
        springLength: 200,
        springConstant: 0.04,
      },
    },
  };

  // Fetch the player list with names when component mounts
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

  // Load the player data and their similar players
  const loadPlayerData = async (playerId: string) => {
    setIsLoading(true);
    setHasError(false);
    try {
      nodesRef.current.clear();
      edgesRef.current.clear();
  
      const playerInfo = await fetchNameAndImage(parseInt(playerId, 10));
      const similarPlayers = await fetchSimilarPlayers(parseInt(playerId, 10));
  
      if (!playerInfo || !similarPlayers.length) {
        console.error("No player info or similar players found. Select another player");
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
          width: mapDistanceToWidth(player.distance),
        }))
      );
  
      if (!networkRef.current) {
        const network = new Network(networkContainerRef.current!, { nodes: nodesRef.current, edges: edgesRef.current }, options);
        networkRef.current = network;
        networkRef.current.setOptions(options);
  
        // Handle click and double-click events on the network
        network.on("click", function (params) {
          if (params.edges.length > 0 && params.nodes.length === 0) {
            const clickedEdgeId = params.edges[0];
            handleEdgeClick(clickedEdgeId); // Handle edge click for comparison
          }
        });
  
        network.on("click", function (params) {
          if (params.nodes.length > 0) {
            const clickedPlayerId = params.nodes[0];
            handlePlayerClick(clickedPlayerId); // Show the summary on single click
          }
        });
  
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
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle single player click to show their summary
  const handlePlayerClick = async (playerId: string) => {
    setIsLoading(true);
    try {
      const summary = await getPlayerSummary(parseInt(playerId, 10));
      const playerInfo = await fetchNameAndImage(parseInt(playerId, 10)); 

      setPlayerSummary(summary);
      setPlayerName(playerInfo.name); 
    } catch (error) {
      console.error("Error fetching player summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edge click to compare two players
  const handleEdgeClick = async (edgeId: string) => {
    const edge = edgesRef.current.get(edgeId);
    if (!edge) return;
  
    const { from, to } = edge;
    setIsLoading(true);
    try {
      const comparisonPayload = {
        player_left: parseInt(from, 10),
        player_right: parseInt(to, 10),
        all: true, 
        offensive: false,
        defensive: false,
        strenghts: false,
        weaknesses: false,
        other: false,
        otherText: ""
      };
  
      const comparison = await comparePlayers(comparisonPayload);
      setComparisonResult(comparison);
    } catch (error) {
      console.error("Error fetching comparison or parsing JSON:", error);
      alert("An error occurred while comparing players. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Expand the network by fetching similar players of the selected player
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
        width: mapDistanceToWidth(player.distance),
      }));

      const filteredEdges = newEdges.filter((edge: { from: string; to: string }) => {
        const existingEdgeFrom = edgesRef.current.get({
          filter: (item: { from: string; to: string }) => item.from === edge.from && item.to === edge.to,
        });
        const existingEdgeTo = edgesRef.current.get({
          filter: (item: { from: string; to: string }) => item.from === edge.to && item.to === edge.from,
        });

        return existingEdgeFrom.length === 0 && existingEdgeTo.length === 0;
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

  // Map the similarity distance to edge width
  const mapDistanceToWidth = (distance: number): number => {
    const minWidth = 1; // minimum edge thickness
    const maxWidth = 10; // maximum edge thickness
    const maxDistance = 45; // maximum distance for normalization

    const normalizedWidth = Math.max(minWidth, Math.min(maxWidth, maxWidth * (1 - distance / maxDistance)));
    return normalizedWidth;
  };

  // Fetch options asynchronously for the player selection dropdown
  const loadOptions = (inputValue: string, callback: (arg0: LabelValue[]) => void) => {
    const filteredPlayers = playerDataLabelAndValue.filter(player =>
      player.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    const limitedPlayers = filteredPlayers.slice(0, 50); 
    
    callback(limitedPlayers);
  };

  // Toggle the physics simulation in the network
  const togglePhysics = () => {
    setPhysicsEnabled((prev) => !prev); // Toggle the physics state
    networkRef.current?.setOptions({ physics: { enabled: !physicsEnabled } }); // Update the network
  };

  // Toggle the help popup
  const toggleHelp = () => setShowHelp(!showHelp);

  
  // Render the component
  return (
    <div className="w-full flex justify-center relative">
      {/* Help Icon in the top-right corner */}
      <div
        className="absolute top-0 right-8 bg-gray-300 rounded-full w-10 h-10 flex justify-center items-center cursor-pointer z-50"
        onClick={toggleHelp}
      >
        <span className="text-xl font-bold text-white">?</span>
      </div>

      {/* Help Popup */}
      {showHelp && (
        <div className="absolute top-16 right-10 bg-white border shadow-lg p-4 rounded-lg z-50">
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
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions={playerDataLabelAndValue.slice(0, 50)}
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

          {/* Player Summary */}
        {playerSummary && (
          <div className="relative mt-4 p-4 border rounded shadow">
            {/* Close Button */}
            <div
              className="absolute top-0 right-2 text-gray-500 cursor-pointer"
              onClick={() => setPlayerSummary(null)}
            >
              ×
            </div>

            <h3 className="text-lg font-semibold">
            {playerName && `${playerName}`}
            </h3>

            <div className="mt-2">
              {playerSummary.split("**").map((section, index) => {
                if (index % 2 !== 0) {
                  return <strong key={index} className="block mt-2">{section}</strong>;
                }
                return (
                  <p key={index} className="mt-1">
                    {section.split("- ").map((part, idx) => (
                      idx === 0 ? part : <span key={idx} className="block">• {part.trim()}</span>
                    ))}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Player Comparison */}
        {comparisonResult && (
          <div className="relative mt-4 p-4 border rounded shadow">
            {/* Close Button */}
            <div
              className="absolute top-0 right-2 text-gray-500 cursor-pointer"
              onClick={() => setComparisonResult(null)}
            >
              ×
            </div>

            {/* Error Handling */}
            {comparisonResult.errorMessage ? (
              <div className="text-red-500">{comparisonResult.errorMessage}</div>
            ) : (
              <>
                <h2 className="text-lg font-semibold">
                  {comparisonResult.player_left_name} vs {comparisonResult.player_right_name}
                </h2>

                <div className="mt-2">
                  <p>{JSON.parse(comparisonResult.comparison).general}</p>
                </div>
              </>
            )}
          </div>
          )}
        </div>
  
        {/* Section 2: Right Main Content Area */}
        <div className="w-3/4 border-l-2 pl-8 flex flex-col space-y-4 sticky top-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Player Network</h2>
            {/* Buttons for zoom-in, zoom-out, and physics toggle */}
            <div className="flex space-x-2 pr-12">
              <Button
                onClick={() => networkRef.current?.moveTo({ scale: networkRef.current?.getScale() * 1.2 })}
              >
                Zoom In
              </Button>
              <Button
                onClick={() => networkRef.current?.moveTo({ scale: networkRef.current?.getScale() * 0.8 })}
              >
                Zoom Out
              </Button>
              <Button
                onClick={togglePhysics}
              >
                {physicsEnabled ? "Disable Physics" : "Enable Physics"}
              </Button>
            </div>
          </div>
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
            position: "relative",
          }}
        >
          {hasError ? (
            <p>Player information not found - please select another player.</p>
          ) : (
            <p>Network will be displayed here once loaded.</p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerNetwork;
