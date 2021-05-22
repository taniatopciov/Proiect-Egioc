class GameObjectPool {
    constructor(assetPaths, assetsLoaded, useAudioLoader = false) {
        this.pool = [];
        this.assetPaths = assetPaths;
        var loader = new THREE.GLTFLoader();
        if (useAudioLoader) {
            loader = new THREE.AudioLoader();
        }
        loadAssets(assetPaths, (assets) => {
            this.pool = assets;
            assetsLoaded();
        }, loader);
    }

    getAsset(assetPath) {
        return this.pool[assetPath]
    }

    getRandomAsset() {
        var randomIndex = math.rand_int(0, this.assetPaths.length - 1);
        var randomAssetPath = this.assetPaths[randomIndex];
        return this.getAsset(randomAssetPath)
    }
}