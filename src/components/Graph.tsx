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
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' },
      { id: 3, label: 'Node 3' },
      { id: 4, label: 'Node 4' },
      { id: 5, label: 'Node 5' }
    ]);

    const edges = new DataSet<Edge>([
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 }
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
