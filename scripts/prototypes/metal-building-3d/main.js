import * as THREE from "three";
import { OrbitControls } from "/vendor/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdbeafe);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(85, 60, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x475569, 2.2));

const sun = new THREE.DirectionalLight(0xffffff, 2.8);
sun.position.set(60, 90, 45);
scene.add(sun);

const grid = new THREE.GridHelper(400, 80, 0x64748b, 0x94a3b8);
scene.add(grid);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
controls.enableDamping = true;
controls.minDistance = 20;
controls.maxDistance = 450;
controls.maxPolarAngle = Math.PI * 0.49;

const building = new THREE.Group();
scene.add(building);

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x8da1b9,
  metalness: 0.45,
  roughness: 0.48,
});
const roofMaterial = new THREE.MeshStandardMaterial({
  color: 0x475569,
  metalness: 0.55,
  roughness: 0.4,
});

const fields = {
  width: document.querySelector("#width"),
  length: document.querySelector("#length"),
  eaveHeight: document.querySelector("#eave-height"),
  roofPitch: document.querySelector("#roof-pitch"),
  wallColor: document.querySelector("#wall-color"),
};

const outputs = {
  width: document.querySelector("#width-value"),
  length: document.querySelector("#length-value"),
  eaveHeight: document.querySelector("#eave-height-value"),
  roofPitch: document.querySelector("#roof-pitch-value"),
};

// Computes the six-point gable profile once, using pitch as rise per 12 feet of run.
function createGableRoofGeometry(width, length, eaveHeight, pitch) {
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const safePitch = Math.max(0, pitch);
  const ridgeHeight = eaveHeight + halfWidth * (safePitch / 12);

  const positions = new Float32Array([
    -halfWidth,
    eaveHeight,
    halfLength,
    0,
    ridgeHeight,
    halfLength,
    halfWidth,
    eaveHeight,
    halfLength,
    -halfWidth,
    eaveHeight,
    -halfLength,
    0,
    ridgeHeight,
    -halfLength,
    halfWidth,
    eaveHeight,
    -halfLength,
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex([
    0, 2, 1, 3, 4, 5, 0, 1, 4, 0, 4, 3, 2, 5, 4, 2, 4, 1,
  ]);
  geometry.computeVertexNormals();
  return geometry;
}

function readDimensions() {
  return {
    width: Number(fields.width.value),
    length: Number(fields.length.value),
    eaveHeight: Number(fields.eaveHeight.value),
    roofPitch: Number(fields.roofPitch.value),
  };
}

function updateLabels({ width, length, eaveHeight, roofPitch }) {
  outputs.width.value = `${width} ft`;
  outputs.length.value = `${length} ft`;
  outputs.eaveHeight.value = `${eaveHeight} ft`;
  outputs.roofPitch.value = `${roofPitch}:12`;
}

function disposeBuildingGeometry() {
  for (const child of building.children) {
    child.geometry.dispose();
  }
  building.clear();
}

function rebuildBuilding() {
  const dimensions = readDimensions();
  updateLabels(dimensions);
  disposeBuildingGeometry();

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(
      dimensions.width,
      dimensions.eaveHeight,
      dimensions.length,
    ),
    wallMaterial,
  );
  walls.position.y = dimensions.eaveHeight / 2;

  const roof = new THREE.Mesh(
    createGableRoofGeometry(
      dimensions.width,
      dimensions.length,
      dimensions.eaveHeight,
      dimensions.roofPitch,
    ),
    roofMaterial,
  );

  building.add(walls, roof);
}

for (const field of [
  fields.width,
  fields.length,
  fields.eaveHeight,
  fields.roofPitch,
]) {
  field.addEventListener("input", rebuildBuilding);
}

fields.wallColor.addEventListener("input", () => {
  wallMaterial.color.set(fields.wallColor.value);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

rebuildBuilding();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
