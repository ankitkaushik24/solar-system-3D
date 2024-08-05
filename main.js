import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  CubeTextureLoader,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  RingGeometry,
  Scene,
  SphereGeometry,
  TextureLoader,
  WebGLRenderer,
} from "three";
import "./style.css";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import sunTexture from "./img/sun.jpg";
import starsTexture from "./img/stars.jpg";
import mercuryTexture from "./img/mercury.jpg";
import venusTexture from "./img/venus.jpg";
import earthTexture from "./img/earth.jpg";
import marsTexture from "./img/mars.jpg";
import jupiterTexture from "./img/jupiter.jpg";
import saturnTexture from "./img/saturn.jpg";
import neptuneTexture from "./img/neptune.jpg";
import uranusTexture from "./img/uranus.jpg";
import plutoTexture from "./img/pluto.jpg";
import saturnRingTexture from "./img/saturn ring.png";
import uranusRingTexture from "./img/uranus ring.png";

const renderer = new WebGLRenderer();
const camera = new PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const scene = new Scene();
const gui = new GUI();
const textureLoader = new TextureLoader();
const planets = [
  {
    name: "mercury",
    texture: mercuryTexture,
    distance: 28,
    radius: 3.2,
    rotationSpeed: 0.004,
    revolutionSpeed: 0.02,
  },
  {
    name: "venus",
    texture: venusTexture,
    distance: 44,
    radius: 5.8,
    rotationSpeed: 0.002,
    revolutionSpeed: 0.015,
  },
  {
    name: "earth",
    texture: earthTexture,
    distance: 62,
    radius: 6,
    rotationSpeed: 0.02,
    revolutionSpeed: 0.01,
  },
  {
    name: "mars",
    texture: marsTexture,
    distance: 78,
    radius: 4,
    rotationSpeed: 0.018,
    revolutionSpeed: 0.008,
  },
  {
    name: "jupiter",
    texture: jupiterTexture,
    distance: 100,
    radius: 12,
    rotationSpeed: 0.04,
    revolutionSpeed: 0.002,
  },
  {
    name: "saturn",
    texture: saturnTexture,
    distance: 138,
    radius: 10,
    rotationSpeed: 0.038,
    revolutionSpeed: 0.0009,
    ring: { texture: saturnRingTexture, innerRadius: 10, outerRadius: 20 },
  },
  {
    name: "uranus",
    texture: uranusTexture,
    distance: 176,
    radius: 7,
    rotationSpeed: 0.03,
    revolutionSpeed: 0.0004,
    ring: { texture: uranusRingTexture, innerRadius: 7, outerRadius: 12 },
  },
  {
    name: "neptune",
    texture: neptuneTexture,
    distance: 200,
    radius: 7,
    rotationSpeed: 0.032,
    revolutionSpeed: 0.0001,
  },
  {
    name: "pluto",
    texture: plutoTexture,
    distance: 216,
    radius: 2.8,
    rotationSpeed: 0.008,
    revolutionSpeed: 0.00007,
  },
];

const pointLight = new PointLight(0xffffff, 5000, 300);
const ambientLight = new AmbientLight(0x333333);
const sun = (() => {
  const geometry = new SphereGeometry(16, 30, 30);
  const material = new MeshBasicMaterial({
    map: textureLoader.load(sunTexture),
  });
  return new Mesh(geometry, material);
})();

const createPlanet = (radius, texture, distance, ring) => {
  const geo = new SphereGeometry(radius, 30, 30);
  const mat = new MeshStandardMaterial({ map: textureLoader.load(texture) });
  const planet = new Mesh(geo, mat);
  planet.position.x = distance;
  const container = new Object3D();
  container.add(planet);

  if (ring) {
    const ringGeo = new RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    const ringMat = new MeshBasicMaterial({
      map: textureLoader.load(ring.texture),
      side: DoubleSide,
      color: "#f2f2f2",
    });
    const ringMesh = new Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = 0.5 * Math.PI;
    planet.add(ringMesh);
  }
  return [container, planet];
};

const planetsObjects = planets.map((planet) => {
  const {
    radius,
    distance,
    name,
    texture,
    rotationSpeed,
    revolutionSpeed,
    ring,
  } = planet;
  const [container, mesh] = createPlanet(radius, texture, distance, ring);

  scene.add(container);

  return [
    () => {
      container.rotateY(planet.revolutionSpeed);
      mesh.rotateY(planet.rotationSpeed);
    },
    container,
    mesh,
  ];
});

planets.forEach((planet, idx) => {
  const folder = gui.addFolder(planet.name);
  const [_, __, mesh] = planetsObjects[idx];
  folder.add(planet, "distance", 10, 300).onChange((e) => {
    mesh.position.x = e;
  });
  folder.add(planet, "radius", 1, 12).onChange((e) => {
    const scale = e / mesh.geometry.parameters.radius; // Calculate the scale factor
    mesh.scale.setScalar(scale);
  });
  folder.add(planet, "rotationSpeed", 0.002, 0.05);
  folder.add(planet, "revolutionSpeed", 0.00007, 0.1);
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app").appendChild(renderer.domElement);

const cubeTextureLoader = new CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

const orbitControls = new OrbitControls(camera, renderer.domElement);
camera.position.set(-90, 140, 140);
orbitControls.update();

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onWindowResize);

scene.add(pointLight, sun, ambientLight);

const render = () => {
  sun.rotateY(0.002);
  planetsObjects.forEach(([fn]) => fn());
  renderer.render(scene, camera);
};

renderer.setAnimationLoop(render);
