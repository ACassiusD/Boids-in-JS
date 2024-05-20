import * as THREE from 'three';
import Util from './util';

const util = new Util();
const MAX_SPEED = 0.005;
const MIN_SPEED = 0.000005;
const VISUAL_RADIUS = 2;  //The radius of how many other boids we can detect around us
const PROTECTED_RADIUS = 1;
const AVOID_FACTOR = 0.05;

class Boid {

    static allBoids = []; //holds all boid instances

    constructor(x, y, z, scene, debug = false) {
        this.isDebugBoid = debug; //For determining wheater to display debug visuals and logs 

        // Set movement Properties
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = util.generateRandomVelocity2D();
        this.maxSpeed = MAX_SPEED;
        
        //Meshes 
        this.protectionRadiusMesh = null
        this.protectionRadiusMesh = null;

        // Create the Cone shape for the main boid mesh, set material and add to scene.
        const geometry = new THREE.ConeGeometry(0.1, 0.25, 16);
        const material = this.isDebugBoid ? util.WHITE_MATERIAL : util.getRandomColorMaterial();
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh); 

        //If it is a debugging boid create the visual debug meshes for the protecton and visual range
        if(this.isDebugBoid){
            var sphereGeometry = new THREE.SphereGeometry(VISUAL_RADIUS)
            this.visualRadiusMesh = new THREE.Mesh(sphereGeometry, util.TRANSPARENT_RED_MATERIAL);
            this.visualRadiusMesh.position.copy(this.position);
            scene.add(this.visualRadiusMesh);

            sphereGeometry = new THREE.SphereGeometry(PROTECTED_RADIUS);
            this.protectionRadiusMesh = new THREE.Mesh(sphereGeometry, util.TRANSPARENT_GREEN_MATERIAL);
            this.protectionRadiusMesh.position.copy(this.position);
            scene.add(this.protectionRadiusMesh);
        }

        // Add this boid to the static array of all boids
        Boid.allBoids.push(this);
    }
    
    //Logic to run each frame
    update() {
        this.velocity.clampLength(0, this.maxSpeed); // Limit the speed
        this.position.add(this.velocity);

        // Create a quaternion representing the direction of the velocity
        const direction = this.velocity.clone().normalize();
        const axis = new THREE.Vector3(0, 1, 0); // Assuming cone is initially pointing along Y-axis
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);

        //Apply 1st rule, Seperation 
        this.addSeperationForce();

        if(this.isDebugBoid){
            console.log(this.velocity);
        }

        // Apply rotation to the mesh, point in the velocity its moving towards 
        this.mesh.setRotationFromQuaternion(quaternion);
        this.mesh.position.copy(this.position);
        
        if(this.isDebugBoid){
            this.visualRadiusMesh.position.copy(this.position);
            this.protectionRadiusMesh.position.copy(this.position);
        }
    }

    getBoidsInArea(radius) {
        const boidsInArea = [];
        for (let boid of Boid.allBoids) {
            if (boid !== this) {
                const distance = this.position.distanceTo(boid.position);
                if (distance <= radius) {
                    boidsInArea.push(boid);
                }
            }
        }
        return boidsInArea.length;
    }

    /**
     * 1st Rule - Seperation
     * Boids move away from other boids that are too close
     * 
     * Loop through every other boid, 
     * get the distance to if the other boid 
     * If the other boid is within the PROTECTION_RADIUS, calculate the vector components for a vector in the direction opposite of the direction to the other boid
     * Accumulate those values in an accumulating vector varibles 
     * **/
    addSeperationForce() {
        // The accumulated separation vector
        var accumulatedSeperationVector = new THREE.Vector3();

        for (let otherBoid of Boid.allBoids) {
            if (otherBoid !== this) {
                //Get the distance to the other boid
                const distance = this.position.distanceTo(otherBoid.position);
                if (distance <= PROTECTED_RADIUS) {
                    accumulatedSeperationVector.x += this.velocity.x - otherBoid.velocity.x;
                    accumulatedSeperationVector.y += this.velocity.y - otherBoid.velocity.y;
                    // accumulatedSeperationVector.z += this.velocity.z - otherBoid.velocity.z;
                }
            }
        }

        this.velocity.x += accumulatedSeperationVector.x * AVOID_FACTOR;
        this.velocity.y += accumulatedSeperationVector.y * AVOID_FACTOR;
        // this.velocity.z += accumulatedSeperationVector.z * AVOID_FACTOR;
    }
}

export default Boid;
