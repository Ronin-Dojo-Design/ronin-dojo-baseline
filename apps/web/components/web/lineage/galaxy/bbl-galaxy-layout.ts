import type { BblGalaxyNode, BblGalaxyPosition, BblGalaxyRole } from "./bbl-galaxy-types";

const ROLE_SIZE: Record<BblGalaxyRole, number> = {
  ROOT_STAR: 0.72,
  LEGEND_STAR: 0.52,
  INSTRUCTOR_PLANET: 0.34,
  STUDENT_MOON: 0.22,
};

const GENERATION_RADIUS: Record<number, number> = {
  0: 0,
  1: 5.2,
  2: 9.3,
  3: 13.2,
};

export function getGalaxyNodeSize(node: BblGalaxyNode) {
  return node.size ?? ROLE_SIZE[node.role] ?? 0.3;
}

export function createBblGalaxyLayout(nodes: BblGalaxyNode[]): BblGalaxyPosition[] {
  return nodes.map((node) => {
    if (node.generation === 0) {
      return { id: node.id, x: 0, y: 0, z: 0 };
    }

    const radius = GENERATION_RADIUS[node.generation] ?? 16;
    const orbitTotal = Math.max(1, node.orbitTotal);
    const angle = (node.orbitIndex / orbitTotal) * Math.PI * 2;

    /**
     * Gentle vertical variance gives the premium star-map feeling
     * without becoming a chaotic 3D hairball.
     */
    const y = Math.sin(angle * 2 + node.generation) * 0.9 + (node.generation - 2) * 0.35;

    /**
     * Elliptical orbits feel more cinematic and less flat.
     */
    const x = Math.cos(angle) * radius * 1.18;
    const z = Math.sin(angle) * radius * 0.82;

    return { id: node.id, x, y, z };
  });
}

export function mergePositionsIntoNodes<TNode extends BblGalaxyNode>(
  nodes: TNode[],
  positions: BblGalaxyPosition[],
) {
  const positionById = new Map(positions.map((position) => [position.id, position]));

  return nodes.map((node) => {
    const position = positionById.get(node.id) ?? { x: 0, y: 0, z: 0 };

    return {
      ...node,
      position,
    };
  });
}
