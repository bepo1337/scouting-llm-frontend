import React, { useEffect, useState, useRef } from 'react';
import { fetchSimilarPlayers, fetchNameAndImage} from '../api';
import { Network } from 'vis-network/standalone';
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

  useEffect(() => {
    async function loadPlayerData(playerId: string) {
      try {
        // Fetch the player's name and image
        const playerInfo = await fetchNameAndImage(parseInt(playerId, 10));
        setCurrentPlayerInfo(playerInfo);

        // Fetch the player's similar players
        const similarPlayers = await fetchSimilarPlayers(parseInt(playerId, 10));
        console.log("Fetched similar players:", similarPlayers);
        
        if (!playerInfo || !similarPlayers.length) {
          console.error('No player info or similar players found.');
          return;
        }
        
/*         async function createNode(playerId: string, distance: number) {
          const playerInfo = await fetchNameAndImage(parseInt(playerId, 10));
          setCurrentPlayerInfo(playerInfo);
          return {
            id: playerId,
            label: playerInfo.name,
            imageURL: playerInfo.imageURL,
            group: 'additional'
          };
        } */

        // Map nodes
        const nodes = [
          {
            id: playerId,
            label: playerInfo.name,
            imageURL: playerInfo.imageURL,
            group: 'central',
          },
          ...similarPlayers.map((player: { player_transfermarkt_id: any; }) => ({
            id: player.player_transfermarkt_id,
            label: `Player ${player.player_transfermarkt_id}`,
            imageURL: 'https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1', // Placeholder image
            group: 'similar', 
          })),
        ];

        console.log("Nodes:", nodes);

        // Map edges
        const edges = similarPlayers.map((player: { player_transfermarkt_id: any; distance: any; }) => ({
          from: playerId,
          to: player.player_transfermarkt_id,
          weight: player.distance,
        }));

        console.log("Edges:", edges);

        setNetworkData({ nodes, edges });

      } catch (error) {
        console.error('Error loading player data:', error);
      }
    }

    loadPlayerData(currentPlayerId);
  }, [currentPlayerId]);

  useEffect(() => {
    if (networkContainerRef.current && networkData.nodes.length > 0) {
      const visNodes = new vis.DataSet(
        networkData.nodes.map(node => ({
          id: node.id,
          label: node.label,
          shape: 'circularImage',
          image: node.imageURL,
          group: node.group,
        }))
      );

      const visEdges = new vis.DataSet(
        networkData.edges.map(edge => ({
          from: edge.from,
          to: edge.to,
          length: edge.weight * 100,
          width: 2,
          color: { color: '#cccccc' },
        }))
      );

      const data = {
        nodes: visNodes,
        edges: visEdges,
      };

      const options = {
        nodes: {
          borderWidth: 2,
          size: 30,
          color: {
            border: '#222222',
            background: '#666666',
          },
          font: { color: '#eeeeee' },
          shape: 'dot',
        },
        edges: {
          color: { color: '#cccccc' },
          width: 2,
        },
        interaction: {
          hover: true,
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -2000,
            springLength: 150,
          },
        },
      };

      if (networkRef.current) {
        networkRef.current.setData(data);
      } else {
        networkRef.current = new Network(networkContainerRef.current, data, options);

        networkRef.current.on('click', function (params) {
          if (params.nodes.length > 0) {
            const playerId = params.nodes[0];
            setCurrentPlayerId(playerId);
          }
        });
      }
    }
  }, [networkData]);

  return (
    <div>
      <div className="player-info">
        {currentPlayerInfo && (
          <div className="current-player">
            <img src={currentPlayerInfo.imageURL} alt={currentPlayerInfo.name} />
            <h2>{currentPlayerInfo.name}</h2>
          </div>
        )}
      </div>
      <div id="network" ref={networkContainerRef} style={{ height: '500px', width: '100%' }} />
    </div>
  );
};

export default PlayerNetwork;
