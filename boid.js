import * as THREE from 'three';
import Util from './util';

const util = new Util();
const MAX_SPEED = 0.09;
const MIN_SPEED = 0.009;
const VISUAL_RADIUS = 2;  //The radius of how many other boids we can detect around us
const PROTECTED_RADIUS = 1;
const AVOID_FACTOR = 0.003;
const TURN_FACTOR = 0.005;

//Debugging
const DRAW_VISUAL_RADIUS = true;
const DRAW_AVOID_RADIUS = true;
const DRAW_SEPERATION_VECTOR = true;
const DRAW_IN_RANGE_LINES = true;
const CONSOLE = document.getElementById('label');

//Wall boundaries 
const TOP_Y_BOUNDARY = 8;
const BOTTOM_Y_BOUNDARY = -8;
const LEFT_X_BOUNDARY = -8;
const RIGHT_X_BOUNDARY = 8;

class Boid {
    static allBoids = []; //holds all boid instances

    constructor(x, y, z, scene, isDebugBoid = false) {
        this.debugLines = [];
        this.isDebugBoid = isDebugBoid; //For determining wheater to display debug visuals and logs 
        this.scene = scene; //TODO: Dont store a new scene object for every boid

        // Set movement Properties
        this.position = new THREE.Vector3(x, y, z);
        this.velocity = util.generateRandomVelocity2D();
        this.acceleration = new THREE.Vector3(); //For gratual steering towards a desired vector rather than instant changes in the velocity.
        
        //Meshes 
        this.avoidRadiusMesh = null
        this.avoidRadiusMesh = null;

        // Create the Cone shape for the main boid mesh, set material and add to scene.
        const geometry = new THREE.ConeGeometry(0.1, 0.25, 16);
        const material = this.isDebugBoid ? util.WHITE_MATERIAL : util.getRandomColorMaterial();
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh); 

        //If it is a debugging boid create the visual debug meshes for the protecton and visual range
        if(this.isDebugBoid){
            this.createDebugMeshes();
            
            // Create the debug line to show direction
            this.createDebugLine();
        }

        // Add this boid to the static array of all boids
        Boid.allBoids.push(this);
    }
    
    //Logic to run each frame
    update() {
        this.clearDebugLineArray();
           
        this.applyForce(this.getSeperationForce());

        this.velocity.add(this.acceleration);  

        //Avoid Walls
        this.AvoidEdges();

        //Limit the max speed.
        this.velocity.clampLength(MIN_SPEED, MAX_SPEED);

        //Update the position based on the velocity
        this.position.add(this.velocity.clone());

        //Update mesh position and rotation.
        const direction = this.velocity.clone().normalize();
        const axis = new THREE.Vector3(0, 1, 0); // Assuming cone is initially pointing along Y-axis
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
        this.mesh.setRotationFromQuaternion(quaternion);
        this.mesh.position.copy(this.position);

        //Display debugger visuals if this is a debug boid.
        this.updateDebugLines();
        this.updateDebugMeshPositions();
        this.updateConsoleText();

        // //Sets acceleration vector to (0,0,0), without this the acceleration accumulates 
        this.acceleration.multiplyScalar(0); 
    }

    /**
     * 1st Rule - Separation: Boids move away from other boids that are too close.
     * 
     * Loop through each boid in the system:
     * - Calculate the distance to every other boid.
     * - If the other boid is within the AVOID_RADIUS, calculate a vector (new_vector) pointing in the opposite direction.
     * - Normalize new_vector and weight it by the distance.
     * - Accumulate all new_vectors into targetVector.
     * 
     * The result is a targetVector pointing away from the sum of all other boids in its vicinity.
     * 
     * @return targetVector - The vector that should be applied to move the boid away from others.
     */
    getSeperationForce() {
        let count = 0;
    
        // The accumulated separation vector
        var targetVector = new THREE.Vector3();
    
        for (let otherBoid of Boid.allBoids) {
            if (otherBoid !== this) {
                // Get the distance to the other boid
                const distance = this.position.clone().distanceTo(otherBoid.position);
                if (distance <= PROTECTED_RADIUS) {
                    let diff = new THREE.Vector3().subVectors(this.position, otherBoid.position);
                    diff.normalize();
                    diff.divideScalar(distance)
                    targetVector.add(diff);
                    this.createDebugLineToBoid(otherBoid);
                    count++; 
                }
            }
        }

        // Average the vector
        if (count > 0) {
            targetVector.divideScalar(count);
        }

        // If there's a separation force, normalize and apply avoid factor
        if (targetVector.length() > 0
        ) {
            targetVector.normalize();
            //Draw the targetVector for debugging
            this.drawSeperationVector(targetVector);
            targetVector.multiplyScalar(AVOID_FACTOR);
        }

        return targetVector;
    }


    // # If the boid is near an edge, make it turn by turnfactor
    AvoidEdges(){
        // Check top margin
        if (this.position.y > TOP_Y_BOUNDARY) {
            this.velocity.y -= TURN_FACTOR;
            if(this.isDebugBoid){
                console.log("too high");
            }
        }
        // Check bottom margin
        if (this.position.y < BOTTOM_Y_BOUNDARY) {
            this.velocity.y += TURN_FACTOR;
            if(this.isDebugBoid){
                console.log("too low");
            }
        }
        // Check right margin
        if (this.position.x > RIGHT_X_BOUNDARY) {
            this.velocity.x -= TURN_FACTOR;
            if(this.isDebugBoid){
                console.log("too right");
            }
        }
        // Check left margin
        if (this.position.x < LEFT_X_BOUNDARY) {
            this.velocity.x += TURN_FACTOR;
            if(this.isDebugBoid){
                console.log("too left");
            }
        }
    }
    

    // Create a line to visualize the direction of the boid
    createDebugLine() {
        if(this.isDebugBoid){
            // Create a material for the line with a basic white color
            const material = new THREE.LineBasicMaterial({ color: 0xffffff });
            
            // Create a geometry for the line.
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                this.velocity
            ]);
            
            // Create the line using the geometry and material
            this.debugLine = new THREE.Line(geometry, material);
            this.scene.add(this.debugLine);
        }
    }

    //Draw a debug line from this boid to the other boid
    createDebugLineToBoid( otherBoid) {
        if(this.isDebugBoid && DRAW_IN_RANGE_LINES == true){
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
            const geometry = new THREE.BufferGeometry().setFromPoints([
                this.position,
                otherBoid.position
            ]);
            var line = new THREE.Line(geometry, material);
            //Add it to the array for cleanup later.
            this.debugLines.push(line);
            this.scene.add(line);
        }
    }

    clearDebugLineArray() {
        this.debugLines.forEach(line => {
            this.scene.remove(line);
        });
        // Clear the array after removing all lines from the scene
        this.debugLines.length = 0;
    }

    // Create a new line, again starting from the origin, adding the direction vector, and updating it to the boids position
    updateDebugLines() {
        if (this.debugLine) {
            // Calculate the direction of the velocity
            const direction = this.velocity.clone().normalize();
    
            // Calculate the end point of the line (a short distance ahead of the boid)
            const endPoint = new THREE.Vector3(0, 0, 0).add(direction);

            const points = [new THREE.Vector3(0, 0, 0), endPoint];
            
            this.debugLine.geometry.setFromPoints(points);

            // Set the start of the line to the boid's current position
            this.debugLine.position.copy(this.position);
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

    // Method to create a line from the boid to a given vector direction
    drawLineFromVector(vector) {
        if(this.isDebugBoid){
            const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

            // Start point is the boid's position
            const start = this.position.clone();
    
            // End point is calculated by adding the vector to the boid's position
            const end = this.position.clone().add(vector);
    
            const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
            var line = new THREE.Line(geometry, material);
    
            // Add it to the array for cleanup later.
            this.debugLines.push(line);
            this.scene.add(line);
        }
    }

    drawSeperationVector(vector){
        if(DRAW_SEPERATION_VECTOR){
            this.drawLineFromVector(vector)
        }
    }

    createDebugMeshes(){
        if(this.isDebugBoid){
            if(DRAW_VISUAL_RADIUS){
                var sphereGeometry = new THREE.SphereGeometry(VISUAL_RADIUS)
                this.visualRadiusMesh = new THREE.Mesh(sphereGeometry, util.TRANSPARENT_RED_MATERIAL);
                this.visualRadiusMesh.position.copy(this.position);
                this.scene.add(this.visualRadiusMesh);    
            }
            if(DRAW_AVOID_RADIUS){
                sphereGeometry = new THREE.SphereGeometry(PROTECTED_RADIUS);
                this.avoidRadiusMesh = new THREE.Mesh(sphereGeometry, util.TRANSPARENT_GREEN_MATERIAL);
                this.avoidRadiusMesh.position.copy(this.position);
                this.scene.add(this.avoidRadiusMesh);
            }
        }
    }

    updateDebugMeshPositions(){
        if(this.isDebugBoid){
            if(DRAW_VISUAL_RADIUS)
                this.visualRadiusMesh.position.copy(this.position);
            if(DRAW_AVOID_RADIUS)
                this.avoidRadiusMesh.position.copy(this.position);
        }
    }

    //Adds force to accelleration variable.
    applyForce(force) {
        this.acceleration.add(force);
    }
    
    updateConsoleText(){
        CONSOLE.innerText = `Acceleration = (${this.acceleration.x.toFixed(4)}, ${this.acceleration.y.toFixed(4)}, ${this.acceleration.z.toFixed(4)})
        Velocity = (${this.velocity.x.toFixed(4)}, ${this.velocity.y.toFixed(4)}, ${this.velocity.z.toFixed(4)})
        Position = (${this.position.x.toFixed(4)}, ${this.position.y.toFixed(4)}, ${this.position.z.toFixed(4)})`;
    }
}

export default Boid;
