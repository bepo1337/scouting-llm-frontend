import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { fetchSimilarPlayers, fetchNameAndImage } from "../api";
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
  const [playerDataLabelAndValue, setPlayerDataLabelAndValue] = useState<LabelValue[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LabelValue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        title: playerInfo.description || "Player description",
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
          if (params.nodes.length > 0) {
            const clickedPlayerId = params.nodes[0];
            expandNetwork(clickedPlayerId);
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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#f0f0f0", padding: "20px", boxSizing: "border-box", alignSelf: "flex-start" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1>Player Network</h1>
          <p>Explore players and their similar counterparts based on different attributes.</p>
        </div>
        <Select
          options={playerDataLabelAndValue}
          value={selectedPlayer}
          onChange={(selectedOption: React.SetStateAction<LabelValue | null>) => {
            setSelectedPlayer(selectedOption);
            setPlayerId(selectedOption?.value || null);
          }}
          placeholder="Select player..."
          isClearable
          className="w-[200px]"
        />
        <Button
          className="mt-4"
          onClick={() => {
            if (playerId) {
              loadPlayerData(playerId);
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Load Network"}
        </Button>
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "10px" }}>
            <ClipLoader size={35} color="#2B7CE9" loading={isLoading} />
          </div>
        )}
      </div>

      {/* Network visualization */}
      <div ref={networkContainerRef} style={{ flex: 1, height: "100vh", padding: "20px", boxSizing: "border-box" }} />
    </div>
  );
};

export default PlayerNetwork;
