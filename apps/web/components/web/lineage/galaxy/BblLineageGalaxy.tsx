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
    <group ref={groupRef} position={[node.position.x, node.position.y, node.position.z]}>
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
            "group min-w-24 rounded-full border px-3 py-1.5 text-left shadow-2xl backdrop-blur-md transition",
            isSelected
              ? "border-yellow-300 bg-black/80 text-yellow-100"
              : "border-white/15 bg-black/55 text-white hover:border-yellow-200/70 hover:bg-black/75",
          ].join(" ")}
        >
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-[10px] font-semibold">
              {node.photoUrl ? (
                <img src={node.photoUrl} alt="" className="h-full w-full object-cover" />
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

function GalaxyEdges({ nodes, edges }: { nodes: PositionedNode[]; edges: BblGalaxyEdge[] }) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

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

        // Build the line imperatively and mount via <primitive>. R3F's <line> JSX intrinsic
        // collides with React's SVG <line> in the type system (resolves to SVGLineElement),
        // so a constructed THREE.Line keeps it type-safe.
        const material = new THREE.LineBasicMaterial({
          color: isPrimary ? "#d7a74c" : "#7fd7ff",
          transparent: true,
          opacity: isPrimary ? 0.42 : 0.24,
        });

        return <primitive key={edge.id} object={new THREE.Line(geometry, material)} />;
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
    const safeDirection = direction.length() > 0 ? direction : new THREE.Vector3(0, 0.25, 1);
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
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Lineage Galaxy</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            A cinematic map of verified public lineage. Stars mark legends, planets mark
            instructors, and moons mark students.
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
              <span className="text-yellow-200">Gold stars</span> - lineage anchors
            </div>
            <div>
              <span className="text-cyan-200">Blue planets</span> - instructors
            </div>
            <div>
              <span className="text-white">White moons</span> - students
            </div>
          </div>
        </div>

        {selectedNode ? (
          <div className="rounded-2xl border border-yellow-200/20 bg-black/65 p-4 text-right text-white shadow-2xl backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-200/70">Selected</p>
            <p className="mt-1 text-lg font-semibold">{selectedNode.displayName}</p>
            <p className="text-sm text-white/60">{selectedNode.rankLabel}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BblLineageGalaxy({ graph, onSelectNode }: BblLineageGalaxyProps) {
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

        <GalaxyShell graph={graph} selectedNode={selectedNode} onSelectNode={handleSelectNode} />
      </Canvas>
    </section>
  );
}
