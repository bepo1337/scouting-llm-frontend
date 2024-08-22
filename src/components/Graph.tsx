import React, { useEffect, useState, useRef } from 'react';
import { fetchSimilarPlayers, fetchNameAndImage } from '../api';
import { Network, DataSet, Options } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

interface PlayerNode {
  id: string;
  label: string;
  imageURL: string;
  group: string;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

const PlayerNetwork: React.FC = () => {
  const defaultPlayerId = '39049';
  const [networkData, setNetworkData] = useState<{ nodes: PlayerNode[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [currentPlayerId, setCurrentPlayerId] = useState<string>(defaultPlayerId);
  const [currentPlayerInfo, setCurrentPlayerInfo] = useState<{ name: string; imageURL: string } | null>(null);
  const networkContainerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  const options: Options = {
    nodes: {
      borderWidth: 5,
      size: 50,
      color: {
        border: '#2B7CE9',
        background: '#97C2FC',
        highlight: {
          border: '#2B7CE9',
          background: '#D2E5FF'
        },
        hover: {
          border: '#2B7CE9',
          background: '#D2E5FF'
        }
      },
      font: {
        color: 'black', // White text for high contrast
        size: 20, // Slightly larger font size
        face: "arial", // Using a clean, readable font
        align: "center", // Centered text
      },
      shape: "circularImage",
    },
    edges: {
      color: "#cccccc", // Light gray edges for subtle connections
      width: 2,
      hoverWidth: 3, // Slightly thicker on hover for visibility
      selectionWidth: 3, // Slightly thicker on selection
    },
    interaction: {
      hover: true, // Enable hover effects for better interactivity
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -3000, // Adjust gravity for better spacing
        springLength: 200, // Longer springs for more space between nodes
        springConstant: 0.04, // Adjust spring strength
      },
    },
  };

  useEffect(() => {
    async function loadPlayerData(playerId: string) {
      try {
        // Fetch the current player's name and image
        const playerInfo = await fetchNameAndImage(parseInt(playerId, 10));
        setCurrentPlayerInfo(playerInfo);

        // Fetch the similar players
        const similarPlayers = await fetchSimilarPlayers(parseInt(playerId, 10));
        console.log("Fetched similar players:", similarPlayers);

        if (!playerInfo || !similarPlayers.length) {
          console.error('No player info or similar players found.');
          return;
        }

        // Fetch the names and images of similar players
        const similarPlayerNodes = await Promise.all(
          similarPlayers.map(async (player: { player_transfermarkt_id: any }) => {
            const similarPlayerInfo = await fetchNameAndImage(parseInt(player.player_transfermarkt_id, 10));
            return {
              id: player.player_transfermarkt_id,
              label: similarPlayerInfo.name,
              image: similarPlayerInfo.imageURL || 'https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1', // Placeholder image if not found
              group: 'similar',
            };
          })
        );

        // Create nodes for both the current player and similar players
        const nodes = new DataSet<PlayerNode>([
          {
            id: playerId,
            label: playerInfo.name,
            image: playerInfo.imageURL,
            group: 'central',
          },
          ...similarPlayerNodes,
        ]);

        console.log("Nodes:", nodes);

        // Create edges between the current player and similar players
        const edges = new DataSet<Edge>(
          similarPlayers.map((player: { player_transfermarkt_id: any; distance: any }) => ({
            from: playerId,
            to: player.player_transfermarkt_id,
            weight: player.distance,
          }))
        );

        console.log("Edges:", edges);

        const data = {
          nodes: nodes,
          edges: edges,
        };
        

        // Create or update the network visualization
        if (networkRef.current) {
          networkRef.current.setData(data);
          networkRef.current.setOptions(options);
        } else {
          const network = new Network(networkContainerRef.current!, data, options);
          network.setOptions(options);
          networkRef.current = network;

          // Add event listener to handle node clicks
          network.on('click', function (params) {
            if (params.nodes.length > 0) {
              const playerId = params.nodes[0];
              setCurrentPlayerId(playerId);  // Update the central node to the clicked node
            }
          });
        }

      } catch (error) {
        console.error('Error loading player data:', error);
      }
    }

    loadPlayerData(currentPlayerId);
  }, [currentPlayerId]);

  return (
    <div
      ref={networkContainerRef}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    ></div>
  );
};

export default PlayerNetwork;
