import * as THREE from 'three';

class Util {
    getRandomColor() {
        return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'); // Ensure 6 digits
    }

    // Generates a new vector with the x, y, z components set to random values between -1 and 1.
    generateRandomVelocity() {
        return new THREE.Vector3(
            Math.random() * 2 - 1, // x component: random value between -1 and 1
            Math.random() * 2 - 1, 
            Math.random() * 2 - 1  
        );
    }

    RED_TRANSPARENT_MATERIAL = new THREE.MeshStandardMaterial({ 
        color: '#ff0000',
        transparent: true,
        opacity: 0.4
    })

    RED_MATERIAL = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    getRandomColorMaterial() {
        return new THREE.MeshStandardMaterial({ color: `#${this.getRandomColor()}` });
    }
    
}

export default Util;
