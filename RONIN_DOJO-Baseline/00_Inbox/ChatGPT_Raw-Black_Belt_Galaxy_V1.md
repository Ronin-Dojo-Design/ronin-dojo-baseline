OSSS — now we’re cooking. This is the right visual target.

From the screenshots, the inspiration stack is:

Three.js + Next.js + GSAP

And the interaction pattern is:

nodes represent important objects
connections evolve / animate
clicking a node zooms into details
smaller connected nodes show related features
scroll can drive the story

For Black Belt Legacy Galaxy v1, I’d translate that into:

Big stars    = Rigan / major lineage anchors / Dirty Dozen
Planets      = black belts / instructors
Moons        = students / direct descendants
Orbits       = promotion cohorts / timeline bands
Constellations = grouped public trees
Click node   = reuse lineage profile drawer
Camera path  = “follow lineage” cosmic zoom

For your answer #12: best choice is deterministic auto-layout for v1, then cached/curated layout later.

Why? For the first 50-node Dirty Dozen demo, deterministic layout keeps storage tiny and lets us ship fast. Later, once the public galaxy looks great, admin can “pin” or “approve” node positions and we cache those coordinates.

⸻

BBL Galaxy v1 package install

npm install three @react-three/fiber @react-three/drei gsap

If TypeScript complains:

npm install -D @types/three

⸻

File 1 — apps/web/components/lineage/galaxy/bbl-galaxy-types.ts

export type BblGalaxyRole =
  | "ROOT_STAR"
  | "LEGEND_STAR"
  | "INSTRUCTOR_PLANET"
  | "STUDENT_MOON";
export type BblVerifiedStatus = "VERIFIED";
export type BblRelationshipType =
  | "PRIMARY_LINEAGE"
  | "PROMOTED_BY"
  | "TRAINED_UNDER";
export type BblDiscipline = "BJJ";
export type BblGalaxyNode = {
  id: string;
  displayName: string;
  initials: string;
  slug: string;
  role: BblGalaxyRole;
  discipline: BblDiscipline;
  rankLabel?: string;
  title?: string;
  photoUrl?: string;
  verifiedStatus: BblVerifiedStatus;
  /**
   * Generation controls distance from the center.
   * 0 = root / major anchor
   * 1 = first orbit
   * 2 = second orbit
   * 3 = moons / students
   */
  generation: number;
  /**
   * Used to place nodes around orbital bands.
   */
  orbitIndex: number;
  orbitTotal: number;
  /**
   * Cohort/group label for timeline bands and constellations.
   */
  groupId?: string;
  groupLabel?: string;
  /**
   * Optional timeline year for story mode later.
   */
  timelineYear?: number;
  /**
   * Size multiplier. If omitted, role decides size.
   */
  size?: number;
};
export type BblGalaxyEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: BblRelationshipType;
  verifiedStatus: BblVerifiedStatus;
  groupId?: string;
};
export type BblGalaxyGroup = {
  id: string;
  label: string;
  kind: "LINEAGE_BRANCH" | "PROMOTION_COHORT" | "TIMELINE_BAND";
  generation: number;
  color: string;
};
export type BblGalaxyPosition = {
  id: string;
  x: number;
  y: number;
  z: number;
};
export type BblGalaxyGraph = {
  nodes: BblGalaxyNode[];
  edges: BblGalaxyEdge[];
  groups: BblGalaxyGroup[];
};
export type BblGalaxySelectedNode = BblGalaxyNode | null;

⸻

File 2 — apps/web/components/lineage/galaxy/bbl-galaxy-mock-data.ts

This gives us the first 50-ish node demo shape. Names can be refined before production. I’m keeping the mock data public/presentation-safe.

import type { BblGalaxyGraph } from "./bbl-galaxy-types";
export const bblGalaxyMockGraph: BblGalaxyGraph = {
  groups: [
    {
      id: "machado-lineage",
      label: "Machado Lineage",
      kind: "LINEAGE_BRANCH",
      generation: 0,
      color: "#f5d27a",
    },
    {
      id: "dirty-dozen",
      label: "Dirty Dozen Constellation",
      kind: "PROMOTION_COHORT",
      generation: 1,
      color: "#d9a441",
    },
    {
      id: "american-bjj",
      label: "American Jiu-Jitsu Expansion",
      kind: "TIMELINE_BAND",
      generation: 2,
      color: "#7fd7ff",
    },
  ],
  nodes: [
    {
      id: "rigan-machado",
      displayName: "Rigan Machado",
      initials: "RM",
      slug: "rigan-machado",
      role: "ROOT_STAR",
      discipline: "BJJ",
      rankLabel: "Red Belt",
      title: "Lineage Anchor",
      verifiedStatus: "VERIFIED",
      generation: 0,
      orbitIndex: 0,
      orbitTotal: 1,
      groupId: "machado-lineage",
      groupLabel: "Machado Lineage",
      timelineYear: 2026,
    },
    {
      id: "bob-bass",
      displayName: "Bob Bass",
      initials: "BB",
      slug: "bob-bass",
      role: "LEGEND_STAR",
      discipline: "BJJ",
      rankLabel: "Coral Belt",
      title: "American Pioneer",
      verifiedStatus: "VERIFIED",
      generation: 1,
      orbitIndex: 0,
      orbitTotal: 12,
      groupId: "dirty-dozen",
      groupLabel: "Dirty Dozen",
      timelineYear: 1990,
    },
    {
      id: "chris-haueter",
      displayName: "Chris Haueter",
      initials: "CH",
      slug: "chris-haueter",
      role: "LEGEND_STAR",
      discipline: "BJJ",
      rankLabel: "Coral Belt",
      title: "Combat Base Pioneer",
      verifiedStatus: "VERIFIED",
      generation: 1,
      orbitIndex: 1,
      orbitTotal: 12,
      groupId: "dirty-dozen",
      groupLabel: "Dirty Dozen",
      timelineYear: 1990,
    },
    {
      id: "erik-paulson",
      displayName: "Erik Paulson",
      initials: "EP",
      slug: "erik-paulson",
      role: "LEGEND_STAR",
      discipline: "BJJ",
      rankLabel: "Coral Belt",
      title: "CSW / MMA Bridge",
      verifiedStatus: "VERIFIED",
      generation: 1,
      orbitIndex: 2,
      orbitTotal: 12,
      groupId: "dirty-dozen",
      groupLabel: "Dirty Dozen",
      timelineYear: 1990,
    },
    {
      id: "john-will",
      displayName: "John Will",
      initials: "JW",
      slug: "john-will",
      role: "LEGEND_STAR",
      discipline: "BJJ",
      rankLabel: "Coral Belt",
      title: "Global Expansion",
      verifiedStatus: "VERIFIED",
      generation: 1,
      orbitIndex: 3,
      orbitTotal: 12,
      groupId: "dirty-dozen",
      groupLabel: "Dirty Dozen",
      timelineYear: 1990,
    },
    {
      id: "dave-meyer",
      displayName: "Dave Meyer",
      initials: "DM",
      slug: "dave-meyer",
      role: "LEGEND_STAR",
      discipline: "BJJ",
      rankLabel: "Black Belt",
      title: "Legacy Historian",
      verifiedStatus: "VERIFIED",
      generation: 1,
      orbitIndex: 4,
      orbitTotal: 12,
      groupId: "dirty-dozen",
      groupLabel: "Dirty Dozen",
      timelineYear: 1990,
    },
    {
      id: "rick-williams",
      displayName: "Rick Williams",
      initials: "RW",
      slug: "rick-williams",
      role: "LEGEND_STAR",
      discipline: "BJJ",
      rankLabel: "Black Belt",
      title: "American Pioneer",
      verifiedStatus: "VERIFIED",
      generation: 1,
      orbitIndex: 5,
      orbitTotal: 12,
      groupId: "dirty-dozen",
      groupLabel: "Dirty Dozen",
      timelineYear: 1990,
    },
    {
      id: "casey-olson",
      displayName: "Casey Olson",
      initials: "CO",
      slug: "casey-olson",
      role: "LEGEND_STAR",
      discipline: "BJJ",
      rankLabel: "Black Belt",
      title: "American Pioneer",
      verifiedStatus: "VERIFIED",
      generation: 1,
      orbitIndex: 6,
      orbitTotal: 12,
      groupId: "dirty-dozen",
      groupLabel: "Dirty Dozen",
      timelineYear: 1990,
    },
    ...Array.from({ length: 24 }).map((_, index) => ({
      id: `instructor-${index + 1}`,
      displayName: `Legacy Instructor ${index + 1}`,
      initials: `L${index + 1}`,
      slug: `legacy-instructor-${index + 1}`,
      role: "INSTRUCTOR_PLANET" as const,
      discipline: "BJJ" as const,
      rankLabel: "Black Belt",
      title: "Instructor",
      verifiedStatus: "VERIFIED" as const,
      generation: 2,
      orbitIndex: index,
      orbitTotal: 24,
      groupId: "american-bjj",
      groupLabel: "American Jiu-Jitsu Expansion",
      timelineYear: 2000 + (index % 12),
    })),
    ...Array.from({ length: 18 }).map((_, index) => ({
      id: `student-${index + 1}`,
      displayName: `Legacy Student ${index + 1}`,
      initials: `S${index + 1}`,
      slug: `legacy-student-${index + 1}`,
      role: "STUDENT_MOON" as const,
      discipline: "BJJ" as const,
      rankLabel: "Student",
      title: "Lineage Student",
      verifiedStatus: "VERIFIED" as const,
      generation: 3,
      orbitIndex: index,
      orbitTotal: 18,
      groupId: "american-bjj",
      groupLabel: "American Jiu-Jitsu Expansion",
      timelineYear: 2010 + (index % 10),
    })),
  ],
  edges: [
    {
      id: "rigan-to-bob",
      sourceId: "rigan-machado",
      targetId: "bob-bass",
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
      groupId: "dirty-dozen",
    },
    {
      id: "rigan-to-chris",
      sourceId: "rigan-machado",
      targetId: "chris-haueter",
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
      groupId: "dirty-dozen",
    },
    {
      id: "rigan-to-erik",
      sourceId: "rigan-machado",
      targetId: "erik-paulson",
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
      groupId: "dirty-dozen",
    },
    {
      id: "rigan-to-john",
      sourceId: "rigan-machado",
      targetId: "john-will",
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
      groupId: "dirty-dozen",
    },
    {
      id: "rigan-to-dave",
      sourceId: "rigan-machado",
      targetId: "dave-meyer",
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
      groupId: "dirty-dozen",
    },
    {
      id: "rigan-to-rick",
      sourceId: "rigan-machado",
      targetId: "rick-williams",
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
      groupId: "dirty-dozen",
    },
    {
      id: "rigan-to-casey",
      sourceId: "rigan-machado",
      targetId: "casey-olson",
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
      groupId: "dirty-dozen",
    },
    ...Array.from({ length: 24 }).map((_, index) => {
      const legendIds = [
        "bob-bass",
        "chris-haueter",
        "erik-paulson",
        "john-will",
        "dave-meyer",
        "rick-williams",
        "casey-olson",
      ];
      return {
        id: `legend-to-instructor-${index + 1}`,
        sourceId: legendIds[index % legendIds.length],
        targetId: `instructor-${index + 1}`,
        relationshipType: "PRIMARY_LINEAGE" as const,
        verifiedStatus: "VERIFIED" as const,
        groupId: "american-bjj",
      };
    }),
    ...Array.from({ length: 18 }).map((_, index) => ({
      id: `instructor-to-student-${index + 1}`,
      sourceId: `instructor-${(index % 12) + 1}`,
      targetId: `student-${index + 1}`,
      relationshipType: "PRIMARY_LINEAGE" as const,
      verifiedStatus: "VERIFIED" as const,
      groupId: "american-bjj",
    })),
  ],
};

⸻

File 3 — apps/web/components/lineage/galaxy/bbl-galaxy-layout.ts

import type {
  BblGalaxyNode,
  BblGalaxyPosition,
  BblGalaxyRole,
} from "./bbl-galaxy-types";
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
    const y =
      Math.sin(angle * 2 + node.generation) * 0.9 +
      (node.generation - 2) * 0.35;
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

⸻

File 4 — apps/web/components/lineage/galaxy/BblLineageGalaxy.tsx

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import type {
  BblGalaxyEdge,
  BblGalaxyGraph,
  BblGalaxyGroup,
  BblGalaxyNode,
} from "./bbl-galaxy-types";
import {
  createBblGalaxyLayout,
  getGalaxyNodeSize,
  mergePositionsIntoNodes,
} from "./bbl-galaxy-layout";
type PositionedNode = BblGalaxyNode & {
  position: {
    x: number;
    y: number;
    z: number;
  };
};
type BblLineageGalaxyProps = {
  graph: BblGalaxyGraph;
  onSelectNode?: (node: BblGalaxyNode) => void;
};
const ROLE_COLOR: Record<BblGalaxyNode["role"], string> = {
  ROOT_STAR: "#f8d98a",
  LEGEND_STAR: "#d7a74c",
  INSTRUCTOR_PLANET: "#63d6ff",
  STUDENT_MOON: "#d8d8e8",
};
function GalaxyShell({
  graph,
  selectedNode,
  onSelectNode,
}: {
  graph: BblGalaxyGraph;
  selectedNode: BblGalaxyNode | null;
  onSelectNode?: (node: BblGalaxyNode) => void;
}) {
  const positions = useMemo(() => createBblGalaxyLayout(graph.nodes), [graph.nodes]);
  const nodes = useMemo(
    () => mergePositionsIntoNodes(graph.nodes, positions),
    [graph.nodes, positions],
  );
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 6, 0]} intensity={2.5} color="#f8d98a" />
      <pointLight position={[-8, 5, 6]} intensity={1.3} color="#7fd7ff" />
      <pointLight position={[8, -4, -8]} intensity={1} color="#b46cff" />
      <Stars radius={80} depth={40} count={2400} factor={4} fade speed={0.28} />
      <Sparkles count={130} scale={[24, 9, 18]} size={2.8} speed={0.25} />
      <TimelineBands groups={graph.groups} />
      <GalaxyEdges nodes={nodes} edges={graph.edges} />
      {nodes.map((node) => (
        <GalaxyNode
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          onSelectNode={onSelectNode}
        />
      ))}
      <CameraZoomController selectedNode={selectedNode} nodes={nodes} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.075} />
    </>
  );
}
function TimelineBands({ groups }: { groups: BblGalaxyGroup[] }) {
  return (
    <>
      {groups.map((group) => {
        const radius = group.generation === 0 ? 1.4 : 4.9 + group.generation * 4.2;
        return (
          <group key={group.id} rotation={[Math.PI / 2.35, 0, 0]}>
            <mesh>
              <torusGeometry args={[radius, 0.015, 12, 160]} />
              <meshBasicMaterial color={group.color} transparent opacity={0.33} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
function GalaxyNode({
  node,
  isSelected,
  onSelectNode,
}: {
  node: PositionedNode;
  isSelected: boolean;
  onSelectNode?: (node: BblGalaxyNode) => void;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const color = ROLE_COLOR[node.role];
  const size = getGalaxyNodeSize(node);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const pulse = Math.sin(clock.elapsedTime * 2.1 + node.orbitIndex) * 0.045;
    const selectedScale = isSelected ? 1.3 : 1;
    groupRef.current.scale.setScalar(selectedScale + pulse);
  });
  return (
    <group
      ref={groupRef}
      position={[node.position.x, node.position.y, node.position.z]}
    >
      <mesh onClick={() => onSelectNode?.(node)}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={node.role === "ROOT_STAR" ? 1.5 : 0.88}
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 1.55, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.2 : 0.09} />
      </mesh>
      {node.role !== "STUDENT_MOON" ? (
        <mesh rotation={[Math.PI / 2.1, 0, 0]}>
          <torusGeometry args={[size * 1.95, 0.015, 8, 90]} />
          <meshBasicMaterial color={color} transparent opacity={0.78} />
        </mesh>
      ) : null}
      <Html
        center
        distanceFactor={node.role === "ROOT_STAR" ? 8 : 10}
        position={[0, size + 0.35, 0]}
      >
        <button
          type="button"
          onClick={() => onSelectNode?.(node)}
          className={[
            "group min-w-[96px] rounded-full border px-3 py-1.5 text-left shadow-2xl backdrop-blur-md transition",
            isSelected
              ? "border-yellow-300 bg-black/80 text-yellow-100"
              : "border-white/15 bg-black/55 text-white hover:border-yellow-200/70 hover:bg-black/75",
          ].join(" ")}
        >
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-[10px] font-semibold">
              {node.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={node.photoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                node.initials
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold leading-tight">
                {node.displayName}
              </span>
              {node.rankLabel ? (
                <span className="block truncate text-[9px] uppercase tracking-[0.18em] text-white/60">
                  {node.rankLabel}
                </span>
              ) : null}
            </span>
          </span>
        </button>
      </Html>
    </group>
  );
}
function GalaxyEdges({
  nodes,
  edges,
}: {
  nodes: PositionedNode[];
  edges: BblGalaxyEdge[];
}) {
  const nodeById = useMemo(() => {
    return new Map(nodes.map((node) => [node.id, node]));
  }, [nodes]);
  return (
    <>
      {edges.map((edge) => {
        const source = nodeById.get(edge.sourceId);
        const target = nodeById.get(edge.targetId);
        if (!source || !target) return null;
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(source.position.x, source.position.y, source.position.z),
          new THREE.Vector3(target.position.x, target.position.y, target.position.z),
        ]);
        const isPrimary = edge.relationshipType === "PRIMARY_LINEAGE";
        return (
          <line key={edge.id} geometry={geometry}>
            <lineBasicMaterial
              color={isPrimary ? "#d7a74c" : "#7fd7ff"}
              transparent
              opacity={isPrimary ? 0.42 : 0.24}
            />
          </line>
        );
      })}
    </>
  );
}
function CameraZoomController({
  selectedNode,
  nodes,
}: {
  selectedNode: BblGalaxyNode | null;
  nodes: PositionedNode[];
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (!selectedNode) {
      gsap.to(camera.position, {
        x: 0,
        y: 8,
        z: 20,
        duration: 1.2,
        ease: "power3.inOut",
        onUpdate: () => camera.lookAt(0, 0, 0),
      });
      return;
    }
    const positioned = nodes.find((node) => node.id === selectedNode.id);
    if (!positioned) return;
    const target = new THREE.Vector3(
      positioned.position.x,
      positioned.position.y,
      positioned.position.z,
    );
    const direction = target.clone().normalize();
    const safeDirection =
      direction.length() > 0 ? direction : new THREE.Vector3(0, 0.25, 1);
    const cameraTarget = target
      .clone()
      .add(safeDirection.multiplyScalar(3.8))
      .add(new THREE.Vector3(0, 1.25, 2.5));
    gsap.to(camera.position, {
      x: cameraTarget.x,
      y: cameraTarget.y,
      z: cameraTarget.z,
      duration: 1.15,
      ease: "power3.inOut",
      onUpdate: () => camera.lookAt(target),
    });
  }, [camera, nodes, selectedNode]);
  return null;
}
function GalaxyHud({
  selectedNode,
  onReset,
  onFollowPath,
}: {
  selectedNode: BblGalaxyNode | null;
  onReset: () => void;
  onFollowPath: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-black/55 p-4 text-white shadow-2xl backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-200/80">
            Black Belt Legacy
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Lineage Galaxy
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            A cinematic map of verified public lineage. Stars mark legends,
            planets mark instructors, and moons mark students.
          </p>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={onFollowPath}
            className="rounded-full border border-yellow-200/30 bg-yellow-200/10 px-4 py-2 text-sm font-medium text-yellow-100 backdrop-blur-md transition hover:bg-yellow-200/20"
          >
            Follow lineage
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
          >
            Reset view
          </button>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/55 p-4 text-xs text-white/70 backdrop-blur-md">
          <div className="grid gap-2">
            <div>
              <span className="text-yellow-200">Gold stars</span> — lineage anchors
            </div>
            <div>
              <span className="text-cyan-200">Blue planets</span> — instructors
            </div>
            <div>
              <span className="text-white">White moons</span> — students
            </div>
          </div>
        </div>
        {selectedNode ? (
          <div className="rounded-2xl border border-yellow-200/20 bg-black/65 p-4 text-right text-white shadow-2xl backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-200/70">
              Selected
            </p>
            <p className="mt-1 text-lg font-semibold">{selectedNode.displayName}</p>
            <p className="text-sm text-white/60">{selectedNode.rankLabel}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
export function BblLineageGalaxy({
  graph,
  onSelectNode,
}: BblLineageGalaxyProps) {
  const [selectedNode, setSelectedNode] = useState<BblGalaxyNode | null>(null);
  function handleSelectNode(node: BblGalaxyNode) {
    setSelectedNode(node);
    onSelectNode?.(node);
  }
  function handleReset() {
    setSelectedNode(null);
  }
  function handleFollowPath() {
    const root = graph.nodes.find((node) => node.role === "ROOT_STAR");
    if (root) {
      setSelectedNode(root);
      onSelectNode?.(root);
    }
  }
  return (
    <section className="relative h-[760px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#02030a] shadow-2xl">
      <GalaxyHud
        selectedNode={selectedNode}
        onReset={handleReset}
        onFollowPath={handleFollowPath}
      />
      <Canvas camera={{ position: [0, 8, 20], fov: 52 }}>
        <color attach="background" args={["#02030a"]} />
        <fog attach="fog" args={["#02030a", 18, 42]} />
        <GalaxyShell
          graph={graph}
          selectedNode={selectedNode}
          onSelectNode={handleSelectNode}
        />
      </Canvas>
    </section>
  );
}

⸻

File 5 — apps/web/components/lineage/galaxy/BblLineageGalaxyDemo.tsx

This wrapper simulates reusing the existing lineage profile drawer. Later, replace MockLineageDrawer with the real LineageProfileDrawer.

"use client";
import { useState } from "react";
import { BblLineageGalaxy } from "./BblLineageGalaxy";
import { bblGalaxyMockGraph } from "./bbl-galaxy-mock-data";
import type { BblGalaxyNode } from "./bbl-galaxy-types";
export function BblLineageGalaxyDemo() {
  const [selectedNode, setSelectedNode] = useState<BblGalaxyNode | null>(null);
  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-200/70">
            Black Belt Legacy
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            The Living Galaxy of Martial Arts Lineage
          </h1>
          <p className="mt-4 text-base leading-7 text-white/65">
            Explore verified public lineage through a cinematic constellation of
            legends, instructors, and students.
          </p>
        </div>
        <BblLineageGalaxy
          graph={bblGalaxyMockGraph}
          onSelectNode={(node) => setSelectedNode(node)}
        />
        <MockLineageDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
function MockLineageDrawer({
  node,
  onClose,
}: {
  node: BblGalaxyNode | null;
  onClose: () => void;
}) {
  if (!node) return null;
  return (
    <aside className="fixed right-4 top-4 z-50 w-[360px] rounded-3xl border border-white/10 bg-zinc-950/95 p-5 text-white shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-200/70">
            Lineage Profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{node.displayName}</h2>
          <p className="mt-1 text-sm text-white/60">{node.rankLabel}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
        >
          Close
        </button>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-yellow-200/30 bg-white/10 text-lg font-semibold">
          {node.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={node.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            node.initials
          )}
        </div>
        <div>
          <p className="text-sm text-white/70">{node.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
            {node.groupLabel}
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm leading-6 text-white/68">
          This panel is a placeholder for the existing lineage profile drawer.
          The production version should reuse the same profile drawer from the
          2D lineage tree.
        </p>
      </div>
    </aside>
  );
}

⸻

File 6 — example Next page

apps/web/app/(public)/lineage/galaxy/page.tsx

import dynamic from "next/dynamic";
const BblLineageGalaxyDemo = dynamic(
  () =>
    import("@/components/lineage/galaxy/BblLineageGalaxyDemo").then(
      (mod) => mod.BblLineageGalaxyDemo,
    ),
  {
    ssr: false,
  },
);
export default function BblLineageGalaxyPage() {
  return <BblLineageGalaxyDemo />;
}

⸻

What this gives us immediately

This first pass gives us:

* premium black/gold/cosmic BBL visual
* Three.js star field
* orbit rings / timeline bands
* stars, planets, moons hierarchy
* click-to-select
* GSAP camera zoom
* profile drawer bridge
* initials fallback
* public verified-only mock graph
* zero heavy storage
* deterministic layout
* clean path to real data later

Next refinement I’d make

Once this is in the repo, I’d add three upgrades:

1. Search overlay:
   type “Bob Bass” → camera flies to node
2. True “follow lineage” mode:
   Rigan → Dirty Dozen → selected instructor → student branch
3. Public-safe API projection:
   database lineage records → sanitized BBL galaxy DTO

And later, when we want that full Mercedes / museum feel:

- bloom/glow postprocessing
- cinematic scroll sections
- constellation labels
- featured legend mode
- timeline story chapters
- profile drawer with article/video/ring/certificate links

This is absolutely worth building. Keep v1 focused on Rigan + Dirty Dozen + verified public stars, and we’ll have something that feels premium, functional, and emotionally different from every boring lineage chart on the internet.