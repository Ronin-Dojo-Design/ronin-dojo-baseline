"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Billboard, OrbitControls, Sparkles, Stars, Text } from "@react-three/drei"
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import gsap from "gsap"
import * as THREE from "three"

import type {
  BblGalaxyEdge,
  BblGalaxyGraph,
  BblGalaxyGroup,
  BblGalaxyNode,
} from "./bbl-galaxy-types"
import {
  createBblGalaxyLayout,
  getGalaxyNodeSize,
  mergePositionsIntoNodes,
} from "./bbl-galaxy-layout"

type PositionedNode = BblGalaxyNode & {
  position: {
    x: number
    y: number
    z: number
  }
}

type BblLineageGalaxyProps = {
  graph: BblGalaxyGraph
  onSelectNode?: (node: BblGalaxyNode) => void
}

// Semantic role palette (NOT brand color — root/legend/instructor/student is meaning, not theme).
const ROLE_COLOR: Record<BblGalaxyNode["role"], string> = {
  ROOT_STAR: "#f8d98a",
  LEGEND_STAR: "#d7a74c",
  INSTRUCTOR_PLANET: "#63d6ff",
  STUDENT_MOON: "#d8d8e8",
}

// HDR-range emissive (>1) so the bright anchors exceed the bloom luminance threshold and read as
// light sources; moons stay sub-threshold so the field never washes out. (A1)
const ROLE_EMISSIVE_INTENSITY: Record<BblGalaxyNode["role"], number> = {
  ROOT_STAR: 2.8,
  LEGEND_STAR: 2,
  INSTRUCTOR_PLANET: 1.15,
  STUDENT_MOON: 0.65,
}

// Always-on labels for the few anchor stars; planets/moons label on hover/selection only, so a
// 65+ node graph never mounts 65 text meshes at once (A0 LOD gating; replaces per-node DOM <Html>).
const ROLE_LABEL_ALWAYS: Record<BblGalaxyNode["role"], boolean> = {
  ROOT_STAR: true,
  LEGEND_STAR: true,
  INSTRUCTOR_PLANET: false,
  STUDENT_MOON: false,
}

const ROLE_LABEL_SIZE: Record<BblGalaxyNode["role"], number> = {
  ROOT_STAR: 0.5,
  LEGEND_STAR: 0.42,
  INSTRUCTOR_PLANET: 0.32,
  STUDENT_MOON: 0.28,
}

function GalaxyShell({
  graph,
  selectedNode,
  onSelectNode,
}: {
  graph: BblGalaxyGraph
  selectedNode: BblGalaxyNode | null
  onSelectNode?: (node: BblGalaxyNode) => void
}) {
  const positions = useMemo(() => createBblGalaxyLayout(graph.nodes), [graph.nodes])

  const nodes = useMemo(
    () => mergePositionsIntoNodes(graph.nodes, positions),
    [graph.nodes, positions],
  )

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 6, 0]} intensity={2.5} color="#f8d98a" />
      <pointLight position={[-8, 5, 6]} intensity={1.3} color="#7fd7ff" />
      <pointLight position={[8, -4, -8]} intensity={1} color="#b46cff" />

      <Starfield />

      <TimelineBands groups={graph.groups} />
      <GalaxyEdges nodes={nodes} edges={graph.edges} />

      {nodes.map(node => (
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
  )
}

/**
 * Layered parallax star field (A2). Two drei <Stars> point clouds at different radii/densities
 * drift at slightly different rates, so nearer stars slide past farther ones — a visibly deeper
 * "pop-off" field than a single flat <Stars>. <Sparkles> adds the near foreground dust.
 */
function Starfield() {
  const farRef = useRef<THREE.Group | null>(null)
  const midRef = useRef<THREE.Group | null>(null)

  useFrame((_, delta) => {
    // delta-scaled so the drift is frame-rate independent; different rates = parallax depth cue.
    if (farRef.current) farRef.current.rotation.y += delta * 0.006
    if (midRef.current) midRef.current.rotation.y += delta * 0.014
  })

  return (
    <>
      <group ref={farRef}>
        <Stars radius={165} depth={70} count={7000} factor={3} saturation={0} fade speed={0.12} />
      </group>
      <group ref={midRef}>
        <Stars
          radius={95}
          depth={45}
          count={3400}
          factor={4.2}
          saturation={0.16}
          fade
          speed={0.3}
        />
      </group>
      <Sparkles
        count={220}
        scale={[30, 12, 22]}
        size={2.6}
        speed={0.22}
        opacity={0.55}
        color="#bcd8ff"
      />
    </>
  )
}

/**
 * Postprocessing stack (A1). NOTE: <EffectComposer> forces `gl.toneMapping = NoToneMapping` while
 * mounted (restoring it on unmount), so the renderer's ACESFilmic setting is bypassed here — the
 * tone-map must run as the final effect instead. Bloom runs first on the linear HDR buffer
 * (frameBufferType HalfFloat), so HDR-range emissive stars bloom, then ACES compresses the result.
 * A HalfFloat buffer is required so emissive values >1 survive to exceed the bloom threshold.
 */
function GalaxyEffects() {
  return (
    <EffectComposer frameBufferType={THREE.HalfFloatType}>
      <Bloom
        mipmapBlur
        intensity={0.9}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.28}
        radius={0.75}
      />
      <Vignette eskil={false} offset={0.26} darkness={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

function TimelineBands({ groups }: { groups: BblGalaxyGroup[] }) {
  return (
    <>
      {groups.map(group => {
        const radius = group.generation === 0 ? 1.4 : 4.9 + group.generation * 4.2

        return (
          <group key={group.id} rotation={[Math.PI / 2.35, 0, 0]}>
            <mesh>
              <torusGeometry args={[radius, 0.015, 12, 160]} />
              <meshBasicMaterial color={group.color} transparent opacity={0.33} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

function GalaxyNode({
  node,
  isSelected,
  onSelectNode,
}: {
  node: PositionedNode
  isSelected: boolean
  onSelectNode?: (node: BblGalaxyNode) => void
}) {
  const groupRef = useRef<THREE.Group | null>(null)
  const [hovered, setHovered] = useState(false)
  const color = ROLE_COLOR[node.role]
  const size = getGalaxyNodeSize(node)
  const isStar = node.role === "ROOT_STAR" || node.role === "LEGEND_STAR"
  const showLabel = isSelected || hovered || ROLE_LABEL_ALWAYS[node.role]
  const labelSize = ROLE_LABEL_SIZE[node.role]

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    const pulse = Math.sin(clock.elapsedTime * 2.1 + node.orbitIndex) * 0.045
    const selectedScale = isSelected ? 1.3 : hovered ? 1.12 : 1

    groupRef.current.scale.setScalar(selectedScale + pulse)
  })

  return (
    <group ref={groupRef} position={[node.position.x, node.position.y, node.position.z]}>
      <mesh
        onClick={event => {
          event.stopPropagation()
          onSelectNode?.(node)
        }}
        onPointerOver={event => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ROLE_EMISSIVE_INTENSITY[node.role]}
          toneMapped={false}
          fog={false}
          roughness={0.25}
          metalness={0.08}
        />
      </mesh>

      {/* Additive inner halo — blooms crisply (A2 glow refinement). */}
      <mesh>
        <sphereGeometry args={[size * 1.55, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.28 : hovered ? 0.2 : 0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      {/* Wider, fainter outer glow — stars only, for the light-source read. */}
      {isStar ? (
        <mesh>
          <sphereGeometry args={[size * 2.6, 24, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.12 : 0.07}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      ) : null}

      {node.role !== "STUDENT_MOON" ? (
        <mesh rotation={[Math.PI / 2.1, 0, 0]}>
          <torusGeometry args={[size * 1.95, 0.015, 8, 90]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ) : null}

      {showLabel ? (
        <Billboard position={[0, size + 0.5, 0]}>
          <Text
            fontSize={labelSize}
            color={isSelected ? "#fde68a" : "#ffffff"}
            anchorX="center"
            anchorY="bottom"
            maxWidth={6}
            outlineWidth={0.012}
            outlineColor="#02030a"
            outlineOpacity={0.85}
            fillOpacity={isSelected || hovered ? 1 : 0.82}
          >
            {node.displayName}
          </Text>
          {(isSelected || hovered) && node.rankLabel ? (
            <Text
              position={[0, -0.12, 0]}
              fontSize={labelSize * 0.52}
              color="#cbd5f5"
              anchorX="center"
              anchorY="top"
              letterSpacing={0.08}
              outlineWidth={0.008}
              outlineColor="#02030a"
              outlineOpacity={0.8}
            >
              {node.rankLabel.toUpperCase()}
            </Text>
          ) : null}
        </Billboard>
      ) : null}
    </group>
  )
}

/**
 * Lineage edges as two merged THREE.LineSegments (primary / secondary), allocated once per
 * graph layout via useMemo and disposed on change — replaces the previous per-render
 * BufferGeometry + LineBasicMaterial allocation for every edge (A0 perf ceiling). Built
 * imperatively and mounted via <primitive> because R3F's <line> JSX intrinsic collides with
 * React's SVG <line> in the type system.
 */
function GalaxyEdges({ nodes, edges }: { nodes: PositionedNode[]; edges: BblGalaxyEdge[] }) {
  const object = useMemo(() => {
    const nodeById = new Map(nodes.map(node => [node.id, node]))

    const buildSegments = (isPrimary: boolean, colorHex: string, opacity: number) => {
      const points: number[] = []

      for (const edge of edges) {
        if ((edge.relationshipType === "PRIMARY_LINEAGE") !== isPrimary) continue
        const source = nodeById.get(edge.sourceId)
        const target = nodeById.get(edge.targetId)
        if (!source || !target) continue

        points.push(
          source.position.x,
          source.position.y,
          source.position.z,
          target.position.x,
          target.position.y,
          target.position.z,
        )
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3))
      const material = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity,
      })

      return new THREE.LineSegments(geometry, material)
    }

    const group = new THREE.Group()
    group.add(buildSegments(true, "#d7a74c", 0.42))
    group.add(buildSegments(false, "#7fd7ff", 0.24))

    return group
  }, [nodes, edges])

  useEffect(() => {
    return () => {
      object.traverse(child => {
        if (child instanceof THREE.LineSegments) {
          child.geometry.dispose()
          const material = child.material
          if (Array.isArray(material)) material.forEach(item => item.dispose())
          else material.dispose()
        }
      })
    }
  }, [object])

  return <primitive object={object} />
}

function CameraZoomController({
  selectedNode,
  nodes,
}: {
  selectedNode: BblGalaxyNode | null
  nodes: PositionedNode[]
}) {
  const { camera } = useThree()

  useEffect(() => {
    if (!selectedNode) {
      gsap.to(camera.position, {
        x: 0,
        y: 8,
        z: 20,
        duration: 1.2,
        ease: "power3.inOut",
        onUpdate: () => camera.lookAt(0, 0, 0),
      })

      return
    }

    const positioned = nodes.find(node => node.id === selectedNode.id)
    if (!positioned) return

    const target = new THREE.Vector3(
      positioned.position.x,
      positioned.position.y,
      positioned.position.z,
    )
    const direction = target.clone().normalize()
    const safeDirection = direction.length() > 0 ? direction : new THREE.Vector3(0, 0.25, 1)
    const cameraTarget = target
      .clone()
      .add(safeDirection.multiplyScalar(3.8))
      .add(new THREE.Vector3(0, 1.25, 2.5))

    gsap.to(camera.position, {
      x: cameraTarget.x,
      y: cameraTarget.y,
      z: cameraTarget.z,
      duration: 1.15,
      ease: "power3.inOut",
      onUpdate: () => camera.lookAt(target),
    })
  }, [camera, nodes, selectedNode])

  return null
}

function GalaxyHud({
  selectedNode,
  onReset,
  onFollowPath,
}: {
  selectedNode: BblGalaxyNode | null
  onReset: () => void
  onFollowPath: () => void
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
  )
}

export function BblLineageGalaxy({ graph, onSelectNode }: BblLineageGalaxyProps) {
  const [selectedNode, setSelectedNode] = useState<BblGalaxyNode | null>(null)

  function handleSelectNode(node: BblGalaxyNode) {
    setSelectedNode(node)
    onSelectNode?.(node)
  }

  function handleReset() {
    setSelectedNode(null)
  }

  function handleFollowPath() {
    const root = graph.nodes.find(node => node.role === "ROOT_STAR")
    if (root) {
      setSelectedNode(root)
      onSelectNode?.(root)
    }
  }

  return (
    <section className="relative h-[760px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#02030a] shadow-2xl">
      <GalaxyHud
        selectedNode={selectedNode}
        onReset={handleReset}
        onFollowPath={handleFollowPath}
      />

      <Canvas
        camera={{ position: [0, 8, 20], fov: 52 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
      >
        <color attach="background" args={["#02030a"]} />
        <fog attach="fog" args={["#02030a", 24, 68]} />

        <GalaxyShell graph={graph} selectedNode={selectedNode} onSelectNode={handleSelectNode} />
        <GalaxyEffects />
      </Canvas>
    </section>
  )
}
