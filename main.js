import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';//For draggable camera
import Boid from './boid.js';

//Javascript Bookmarklet for FPS counter. https://github.com/mrdoob/stats.js
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

//Instantiate needed objects and constants for the scene.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer(); 
const NUMBER_OF_BOIDS = 150;
const boids = [];

/*==================================================
  =            INITIALIZE SCENE AND CAMERA         =
  ==================================================*/
camera.position.z = 10;
const backgroundColor = new THREE.Color( 'skyblue' );
scene.background = backgroundColor;

//Set screen render size to window size
renderer.setSize( window.innerWidth, window.innerHeight );

//Append the renderer to the html body.
document.body.appendChild( renderer.domElement );

// Ambient light provides uniform illumination, revealing the color of objects but without shadows or highlights.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

// Directional light adds contrast through shadows and highlights, defining edges and surface details.
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

//Orbit camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.25; 
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation


/*==================================================
=            SETUP OBJECTS IN SCENE SETUP          =
==================================================*/
//Create cube geometry that defines the shape and structure of a 3D object (cube)
const geometry = new THREE.BoxGeometry( 1, 1, 1 );

// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 }); //Not effected by lighting.
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); //Black unless light is illuminating it.

//Create a mesh from the cube and add it to the scene and apply a material.
const cube = new THREE.Mesh( geometry, material );
scene.add( cube ); //Default position 0,0,0

// Spawn many normal boid objects and a single debug boid to the scene
for (let i = 0; i < NUMBER_OF_BOIDS; i++) {
    const isDebugBoid = (i === NUMBER_OF_BOIDS - 1);
    const x = Math.random() * 10 - 5;
    const y = Math.random() * 10 - 5;
    const z = Math.random() * 10 - 5;
    const boid = new Boid(x, y, 0, scene, isDebugBoid);
    boids.push(boid);
}

/*==================================================
=                      METHODS                     =
==================================================*/
// Update renderer size on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//To call the boids update function every frame
function updateBoids() {
    for (let i = 0; i < boids.length; i++) {
        boids[i].update();
    }
}
function animate() {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    updateBoids(); // Update boids
    renderer.render( scene, camera );
}


/*==================================================
=                        LOGIC                     =
==================================================*/
animate();
