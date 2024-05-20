import * as THREE from 'three';
import Util from './util';

const MAX_SPEED = 0.0009;
const MAX_FORCE = 0.2;
const util = new Util(); //Util object
const PERCEPTION_RADIUS = 2;  //The radius of how many other boids we can detect around us

class Boid {
    constructor(x, y, z, scene, debug = false) {
        this.isDebugBoid = debug;
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = util.generateRandomVelocity();
        this.acceleration = new THREE.Vector3();
        this.maxSpeed = MAX_SPEED;
        this.maxForce = MAX_FORCE; 

        //Create the boids mesh, set the material and add it to the scene.
        const geometry = new THREE.ConeGeometry(0.1, 0.25, 16);
        const material = util.getRandomColorMaterial();
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh); 

        if(this.isDebugBoid){
            //Create Perseption radius mesh and add it to the scene
            const SphereGeometry = new THREE.SphereGeometry(PERCEPTION_RADIUS)
            this.perseptionMesh = new THREE.Mesh(SphereGeometry, util.RED_TRANSPARENT_MATERIAL);
            this.perseptionMesh.position.copy(this.position);
            scene.add(this.perseptionMesh);
        }
    }
    
    update() {
        this.velocity.clampLength(0, this.maxSpeed); // Limit the speed
        this.position.add(this.velocity);

        // Create a quaternion representing the direction of the velocity
        const direction = this.velocity.clone().normalize();
        const axis = new THREE.Vector3(0, 1, 0); // Assuming cone is initially pointing along Y-axis
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);

        // Apply the quaternion to the cone's rotation
        this.mesh.setRotationFromQuaternion(quaternion);

        this.mesh.position.copy(this.position);
        
        if(this.isDebugBoid){
            this.perseptionMesh.position.copy(this.position);
        }
    }

    calculateSeperationForce(){
        //A sphere how much we can see 
        //Get all nerby boids 
        //For each nearby boid 
            //Calculate the direction to the boid 
            //Create a force in the opposite direction
            //Add it to the total force
        //Return the total force
    }

    applyForce(force) {
        this.acceleration.add(force); // Change acceleration based on applied force
    }
}

export default Boid;
