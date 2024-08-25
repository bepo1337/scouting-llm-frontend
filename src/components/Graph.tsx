import React, { useEffect, useState, useRef } from 'react';
import { fetchSimilarPlayers, fetchNameAndImage } from '../api';
import { Network, DataSet, Options } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

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

const PlayerNetwork: React.FC = () => {
  const defaultPlayerId = '39049';
  const networkContainerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesRef = useRef<DataSet<PlayerNode>>(new DataSet());
  const edgesRef = useRef<DataSet<Edge>>(new DataSet());

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
        color: 'black',
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
    loadPlayerData(defaultPlayerId);
  }, []);

  const loadPlayerData = async (playerId: string) => {
    try {
      const playerInfo = await fetchNameAndImage(parseInt(playerId, 10));
      const similarPlayers = await fetchSimilarPlayers(parseInt(playerId, 10));

      if (!playerInfo || !similarPlayers.length) {
        console.error('No player info or similar players found.');
        return;
      }

      const centralNode: PlayerNode = {
        id: playerId,
        label: playerInfo.name,
        image: playerInfo.imageURL,
        group: 'central',
      };

      nodesRef.current.add(centralNode);

      const similarPlayerNodes = await Promise.all(
        similarPlayers.map(async (player: { player_transfermarkt_id: string }) => {
          const similarPlayerInfo = await fetchNameAndImage(parseInt(player.player_transfermarkt_id, 10));
          return {
            id: player.player_transfermarkt_id,
            label: similarPlayerInfo.name,
            image: similarPlayerInfo.imageURL || 'https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1',
            group: 'similar',
          };
        })
      );

      nodesRef.current.add(
        similarPlayerNodes.filter(node => !nodesRef.current.get(node.id))
      );

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

        network.on('click', function (params) {
          if (params.nodes.length > 0) {
            const clickedPlayerId = params.nodes[0];
            expandNetwork(clickedPlayerId);
          }
        });
      } else {
        networkRef.current.setData({ nodes: nodesRef.current, edges: edgesRef.current });
      }

    } catch (error) {
      console.error('Error loading player data:', error);
    }
  };

  const expandNetwork = async (playerId: string) => {
    try {
      const playerInfo = await fetchNameAndImage(parseInt(playerId, 10));
      const similarPlayers = await fetchSimilarPlayers(parseInt(playerId, 10));

      if (!playerInfo || !similarPlayers.length) {
        console.error('No player info or similar players found.');
        return;
      }

      // Fetch and filter nodes
      const similarPlayerNodes = await Promise.all(
        similarPlayers.map(async (player: { player_transfermarkt_id: string }) => {
            const similarPlayerInfo = await fetchNameAndImage(parseInt(player.player_transfermarkt_id, 10));
            return {
                id: player.player_transfermarkt_id,
                label: similarPlayerInfo.name,
                image: similarPlayerInfo.imageURL || 'https://img.a.transfermarkt.technology/portrait/header/default.jpg?lm=1',
                group: 'similar',
            };
        })
    );

    nodesRef.current.add(
        similarPlayerNodes.filter(node => !nodesRef.current.get(node.id))
    );

    // Filter out duplicate edges before adding
    const newEdges = similarPlayers.map((player: { player_transfermarkt_id: string; distance: number }) => ({
        from: playerId,
        to: player.player_transfermarkt_id,
        weight: player.distance,
    }));

    const filteredEdges = newEdges.filter((edge: { from: any; to: any; }) => {
        // Check if the edge already exists
        const existingEdge = edgesRef.current.get({
            filter: (item: { from: any; to: any; }) => item.from === edge.from && item.to === edge.to
        });
        return existingEdge.length === 0; // Only add if no matching edge exists
    });

    edgesRef.current.add(filteredEdges);

      console.log('expanded network:', nodesRef.current, edgesRef.current);

      networkRef.current?.setData({ nodes: nodesRef.current, edges: edgesRef.current });

    } catch (error) {
      console.error('Error expanding network:', error);
    }
  };

  return (
    <div
      ref={networkContainerRef}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    ></div>
  );
};

export default PlayerNetwork;
