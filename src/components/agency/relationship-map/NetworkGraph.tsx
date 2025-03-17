
import React, { useRef, useEffect } from 'react';
import { Business } from '@/types/business';
import { AgencyClientRelationship } from '@/services/discovery/agency/agencyRelationshipService';
import { ForceGraph2D } from 'react-force-graph';
import { useTheme } from 'next-themes';

interface NetworkGraphProps {
  agencies: Business[];
  clients: Business[];
  relationships: AgencyClientRelationship[];
  selectedAgencyId: string | null;
}

interface GraphNode {
  id: string;
  name: string;
  type: 'agency' | 'client';
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  agencies,
  clients,
  relationships,
  selectedAgencyId
}) => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';

  // Prepare data for the force graph
  const graphData = React.useMemo(() => {
    // Create nodes for agencies and clients
    const nodes: GraphNode[] = [
      ...agencies.map(agency => ({
        id: agency.id,
        name: agency.name,
        type: 'agency' as const,
        val: 8 // Agency nodes are bigger
      })),
      ...clients.map(client => ({
        id: client.id,
        name: client.name,
        type: 'client' as const,
        val: 5 // Client nodes are smaller
      }))
    ];

    // Create links between agencies and clients
    const links: GraphLink[] = relationships.map(rel => ({
      source: rel.agency_id,
      target: rel.client_id,
      value: 1
    }));

    return { nodes, links };
  }, [agencies, clients, relationships]);

  // Resize the graph when the container size changes
  useEffect(() => {
    if (!graphRef.current || !containerRef.current) return;

    const resizeGraph = () => {
      if (graphRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        graphRef.current.width(width);
        graphRef.current.height(height);
      }
    };

    resizeGraph();
    window.addEventListener('resize', resizeGraph);

    return () => {
      window.removeEventListener('resize', resizeGraph);
    };
  }, [graphRef, containerRef]);

  // Focus on the selected agency
  useEffect(() => {
    if (!graphRef.current || !selectedAgencyId) return;
    
    // Find the node corresponding to the selected agency
    const selectedNode = graphData.nodes.find(node => node.id === selectedAgencyId);
    if (selectedNode) {
      graphRef.current.centerAt(
        selectedNode.x, 
        selectedNode.y, 
        1000
      );
      
      setTimeout(() => {
        graphRef.current.zoom(2, 1000);
      }, 500);
    }
  }, [selectedAgencyId, graphData.nodes]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={node => `${(node as GraphNode).name} (${(node as GraphNode).type})`}
        nodeColor={node => 
          (node as GraphNode).id === selectedAgencyId 
            ? '#ff6b6b' 
            : (node as GraphNode).type === 'agency' 
              ? (isDarkTheme ? '#8be9fd' : '#0284c7') 
              : (isDarkTheme ? '#bd93f9' : '#6366f1')
        }
        nodeRelSize={6}
        linkWidth={1}
        linkColor={() => isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
        backgroundColor={isDarkTheme ? '#1e1e2e' : '#ffffff'}
        width={containerRef.current?.clientWidth || 500}
        height={containerRef.current?.clientHeight || 400}
      />
    </div>
  );
};

export default NetworkGraph;
