import React, { useState, useEffect } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { ChartBarIcon, NetworkIcon, RouteIcon, PlusIcon, TrashIcon } from 'lucide-react';

const NetworkGraphVisualizer = () => {
  const [nodes, setNodes] = useState(new DataSet([]));
  const [edges, setEdges] = useState(new DataSet([]));
  const [network, setNetwork] = useState(null);
  const [newNode, setNewNode] = useState('');
  const [newEdge, setNewEdge] = useState({
    from: '',
    to: '',
    weight: 1
  });
  const [shortestPath, setShortestPath] = useState([]);

  // Dijkstra's Algorithm Implementation
  const dijkstra = (graph, startNode, endNode) => {
    const distances = {};
    const previous = {};
    const pq = [];

    // Initialize
    graph.nodes.forEach(node => {
      distances[node.id] = Infinity;
      previous[node.id] = null;
    });
    distances[startNode] = 0;
    pq.push({ node: startNode, distance: 0 });

    while (pq.length) {
      pq.sort((a, b) => a.distance - b.distance);
      const { node } = pq.shift();

      if (node === endNode) break;

      graph.edges.forEach(edge => {
        if (edge.from === node || edge.to === node) {
          const neighbor = edge.from === node ? edge.to : edge.from;
          const distance = distances[node] + edge.weight;

          if (distance < distances[neighbor]) {
            distances[neighbor] = distance;
            previous[neighbor] = node;
            pq.push({ node: neighbor, distance });
          }
        }
      });
    }

    // Reconstruct path
    const path = [];
    let current = endNode;
    while (current) {
      path.unshift(current);
      current = previous[current];
    }

    return { path, distance: distances[endNode] };
  };

  // Network Visualization Options
  const options = {
    nodes: {
      color: {
        background: '#4a90e2',
        border: '#2c3e50',
        highlight: {
          background: '#3498db',
          border: '#2980b9'
        }
      },
      font: {
        color: 'white',
        size: 14,
        bold: {
          color: 'white'
        }
      },
      shape: 'circle',
      size: 25
    },
    edges: {
      color: {
        color: '#34495e',
        highlight: '#2c3e50'
      },
      width: 2,
      smooth: {
        type: 'dynamic'
      }
    },
    physics: {
      stabilization: true,
      barnesHut: {
        gravitationalConstant: -3000,
        springLength: 200,
        springConstant: 0.01
      }
    }
  };

  // Add Node
  const addNode = () => {
    if (newNode && !nodes.get(newNode)) {
      nodes.add({ id: newNode, label: newNode });
      setNewNode('');
    }
  };

  // Add Edge
  const addEdge = () => {
    const { from, to, weight } = newEdge;
    if (from && to && weight && 
        nodes.get(from) && 
        nodes.get(to)) {
      edges.add({ 
        from, 
        to, 
        label: weight.toString(), 
        weight: parseFloat(weight) 
      });
      setNewEdge({ from: '', to: '', weight: 1 });
    }
  };

  // Find Shortest Path
  const findShortestPath = () => {
    const { from, to } = newEdge;
    if (from && to) {
      const result = dijkstra(
        { 
          nodes: nodes.get(), 
          edges: edges.get() 
        }, 
        from, 
        to
      );
      setShortestPath(result);
    }
  };

  // Clear Network
  const clearNetwork = () => {
    nodes.clear();
    edges.clear();
    setShortestPath([]);
  };

  // Initialize Network
  useEffect(() => {
    if (!network) {
      const container = document.getElementById('network-graph');
      const networkInstance = new Network(container, { nodes, edges }, options);
      setNetwork(networkInstance);
    }
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
    <div className="container mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        
        {/* Graph Visualization */}
        <div className="md:col-span-2 p-6 bg-gray-100 h-full">
          <div 
            id="network-graph" 
            className="w-full h-full border-2 border-blue-500 rounded-lg"
          />
        </div>

        {/* Control Panel */}
        <div className="p-6 bg-white space-y-6 h-full flex flex-col justify-between">
          <div className="bg-blue-50 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <NetworkIcon className="mr-2 text-blue-600" /> 
              Network Controls
            </h2>

            {/* Add Node and Add Edge Controls */}
            <div className="space-y-4">
              {/* Node Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Add Node</label>
                <div className="flex">
                  <input 
                    type="text" 
                    value={newNode}
                    onChange={(e) => setNewNode(e.target.value.toUpperCase())}
                    placeholder="Node Name"
                    className="flex-grow p-2 border rounded-l-lg"
                  />
                  <button 
                    onClick={addNode}
                    className="bg-blue-500 text-white p-2 rounded-r-lg"
                  >
                    <PlusIcon size={20} />
                  </button>
                </div>
              </div>

              {/* Edge Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Add Connection</label>
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    value={newEdge.from}
                    onChange={(e) => setNewEdge({...newEdge, from: e.target.value.toUpperCase()})}
                    placeholder="From"
                    className="p-2 border rounded"
                  />
                  <input 
                    type="text" 
                    value={newEdge.to}
                    onChange={(e) => setNewEdge({...newEdge, to: e.target.value.toUpperCase()})}
                    placeholder="To"
                    className="p-2 border rounded"
                  />
                  <input 
                    type="number" 
                    value={newEdge.weight}
                    onChange={(e) => setNewEdge({...newEdge, weight: e.target.value})}
                    placeholder="Weight"
                    className="p-2 border rounded"
                  />
                </div>
                <div className="flex space-x-2 mt-2">
                  <button 
                    onClick={addEdge}
                    className="flex-grow bg-green-500 text-white p-2 rounded"
                  >
                    Add Edge
                  </button>
                  <button 
                    onClick={findShortestPath}
                    className="flex-grow bg-purple-500 text-white p-2 rounded"
                  >
                    <RouteIcon size={20} className="inline mr-2" />
                    Find Path
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Network Button */}
          <button 
            onClick={clearNetwork}
            className="w-full bg-red-500 text-white p-2 rounded mt-4 flex items-center justify-center"
          >
            <TrashIcon size={20} className="mr-2" />
            Clear Network
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default NetworkGraphVisualizer;