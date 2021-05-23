class Stable {

    constructor(scene) {
        this.scene = scene;
        this.position = new THREE.Vector3(-15, 5, 0);
        this.mesh = null;
        this.gone = false;

        const stableLoader = new THREE.GLTFLoader();
        stableLoader.load('resources/buildings/stable.json', (stable) => {

            this.mesh = stable.scene;
            this.mesh.scale.setScalar(2);
            this.scene.add(this.mesh);

            this.mesh.quaternion.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0), Math.PI / 2);

            this.mesh.traverse(c => {
                let materials = c.material;
                if (!(c.material instanceof Array)) {
                    materials = [c.material];
                }

                c.castShadow = true;
                c.receiveShadow = true;
            });



        }, undefined, function (error) {
            console.error(error);
        });
    }

    update(deltaTime) {
        if (!this.mesh) {
            return;
        }

        this.position.x -= deltaTime * playerMovementSpeed;
        if (this.position.x < -500) {
            this.scene.remove(this.mesh);
            this.gone = true;
            return;
        }

        this.mesh.position.copy(this.position);
    }
}