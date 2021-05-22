
function loadAssets(pathsToAssets, onAssetsLoaded, loader) {
    var assets = [];
    var count = pathsToAssets.length;

    for (let i = 0; i < pathsToAssets.length; i++) {
        const path = pathsToAssets[i];
        loader.load(path, (asset) => {
            assets[path] = asset;

            count--;
            if (count == 0) {
                onAssetsLoaded(assets);
            }
        });
    }
}