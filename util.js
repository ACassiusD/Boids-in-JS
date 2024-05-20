import * as THREE from 'three';

class Util {
    getRandomColor() {
        return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'); // Ensure 6 digits
    }

    // Generates a new vector with the x, y, z components set to random values between -1 and 1.
    generateRandomVelocity3D() {
        return new THREE.Vector3(
            Math.random() * 2 - 1, // x component: random value between -1 and 1
            Math.random() * 2 - 1, 
            Math.random() * 2 - 1  
        );
    }

    generateRandomVelocity2D() {
        return new THREE.Vector3(
            Math.random() * 2 - 1, // x component: random value between -1 and 1
            Math.random() * 2 - 1, 
            0
        );
    }

    TRANSPARENT_RED_MATERIAL = new THREE.MeshStandardMaterial({ 
        color: '#ff0000',
        transparent: true,
        opacity: 0.4,
        depthWrite: false //Prevent material from writing to the depth buffer, for see a transparent object inside another
    });

    TRANSPARENT_GREEN_MATERIAL = new THREE.MeshStandardMaterial({ 
        color: '#00ff00',  // Green color
        transparent: true,
        opacity: 0.4,
        depthWrite: false
    });


    RED_MATERIAL = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    WHITE_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xffffff });

    getRandomColorMaterial() {
        return new THREE.MeshStandardMaterial({ color: `#${this.getRandomColor()}` });
    }
    
}

export default Util;
