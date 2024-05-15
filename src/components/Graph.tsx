import React, { useEffect, useRef } from 'react';
import { DataSet, Network, Options } from 'vis-network/standalone';

interface Node {
  id: number;
  label: string;
}

interface Edge {
  id?: number;
  from: number;
  to: number;
}

const Graph: React.FC = () => {
  const networkContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = new DataSet<Node>([
      { id: 1, label: 'Luka Jovic' },
      { id: 2, label: 'Andre Silva' },
      { id: 3, label: 'Hugo Ekitike' },
      { id: 4, label: 'Kevin de Bruyne' },
      { id: 5, label: 'Neymar' },
      { id:6 , label: 'Mbappe' },
      { id: 7, label: 'Ibrahimovic' },
      { id: 8, label: 'Kolo Muani' },
      { id: 9, label: 'Cavani' },
      { id: 10, label: 'Messi' }
    ]);

    const edges = new DataSet<Edge>([
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
      { from: 5, to: 6 } ,
      { from: 6, to: 7 } ,
      { from: 6, to: 8 } ,
      { from: 6, to: 9 } ,
      { from: 6, to: 10 } 
    ]);

    const data = {
      nodes: nodes,
      edges: edges
    };

    const options: Options = {};

    const network = new Network(networkContainerRef.current!, data, options);

    return () => {
      network.destroy();
    };
  }, []);

  return <div style={{ width: '600px', height: '400px' }} ref={networkContainerRef}></div>;
};

export default Graph;
