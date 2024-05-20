import * as THREE from 'three';
import Util from './util';

const MAX_SPEED = 0.0009;
const MAX_FORCE = 0.1;
const util = new Util(); //Util object

class Boid {
    constructor(x, y, z, scene) {
        //Set given inital position and random velocity 
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = this.generateRandomVelocity();
        
        //Set more class properties
        this.acceleration = new THREE.Vector3();
        this.maxSpeed = MAX_SPEED;
        this.maxForce = MAX_FORCE; 

        //For well-structured Three.js apps, it's common to encapsulate the behavior and appearance of an object within its class.
        //So it is approriate for it to add itself to the scene and create its mesh with the three library.
        const geometry = new THREE.ConeGeometry(0.1, 0.25, 16);
        // const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const material = new THREE.MeshStandardMaterial({ color: `#${util.getRandomColor()}` });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh); // Add boid mesh to the scene
    }
    getRandomColor() {
        return Math.floor(Math.random() * 16777215).toString(16);
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
    }

    applyForce(force) {
        this.acceleration.add(force); // Change acceleration based on applied force
    }

    // Generates a new vector with the x, y, z components set to random values between -1 and 1.
    // This is used to initialize the boid's velocity with a random direction and magnitude.
    generateRandomVelocity() {
        return new THREE.Vector3(
            Math.random() * 2 - 1, // x component: random value between -1 and 1
            Math.random() * 2 - 1, 
            Math.random() * 2 - 1  
        );
    }
}

export default Boid;
