const _VS = `
    varying vec3 vWorldPosition;

    void main()  {
        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`;

const _FS = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;

    void main() {
        float h = normalize( vWorldPosition + offset ).y;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
    }`;

var gameStarted = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const loader = new THREE.GLTFLoader();

this.controls = new OrbitControls(camera, renderer.domElement);

document.addEventListener("keydown", event => {
    switch (event.code) {
        case "KeyD": {
            this.controls.enabled = !this.controls.enabled;
            document.getElementById("controls-disabled").style.display = !this.controls.enabled ? "flex" : "none";
        } break;
    }
});

camera.position.set(-10, 8, 15);

// camera.position.set(-10, 8, -30);
// camera.lookAt(8, 0, 15);

// camera.position.set(-15, 10, 50);
// camera.lookAt(8, 0 , 0);

controls.update();
document.getElementById("controls-disabled").style.display = !this.controls.enabled ? "flex" : "none";

let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);

light.position.set(3, 20, 10);
// light.position.set(0, 50, 0);
// light.target.position.set(-40, 0, 60);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 4096;
light.shadow.mapSize.height = 4096;
light.shadow.camera.far = 200.0;
light.shadow.camera.near = 1.0;
light.shadow.camera.left = 50;
light.shadow.camera.right = -50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;
scene.add(light);

light = new THREE.AmbientLight(0x404040, 0.4); // soft white light
scene.add(light);

scene.background = new THREE.Color(0x0077FF);
scene.fog = new THREE.FogExp2(0x89b2eb, 0.005);

const texture_loader = new THREE.TextureLoader();

const ground_texture = texture_loader.load('./resources/grass/grass2.png');

ground_texture.wrapS = THREE.RepeatWrapping;
ground_texture.wrapT = THREE.RepeatWrapping;
ground_texture.repeat.set(200, 200);

const grass_material = new THREE.MeshStandardMaterial({
    map: ground_texture,
});

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1100, 1100, 10, 10),
    grass_material);

ground.castShadow = false;
ground.receiveShadow = true;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const uniforms = {
    topColor: { value: new THREE.Color(0x0077FF) },
    bottomColor: { value: new THREE.Color(0x89b2eb) },
    offset: { value: 33 },
    exponent: { value: 0.6 }
};
const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
const skyMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: _VS,
    fragmentShader: _FS,
    side: THREE.BackSide,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

var poolLoadedCount = 0;
var stable;
var world;
var player;
var background;

const poolCount = 4;

const gatesPath = [
    './resources/obstacles/gate1.json',
    './resources/obstacles/gate2.json',
    './resources/obstacles/gate3.json'
];

const gatePool = new GameObjectPool(gatesPath, () => {
    poolLoadedCount++;
    if (poolLoadedCount == poolCount) {
        startGame();
    }
});

const foliagePath = [
    './resources/trees/willow.json',
    './resources/trees/bush2.json',
    './resources/trees/commontree.json',
    './resources/trees/commontree2.json',
    './resources/trees/birchtree.json',
    './resources/trees/bush1.json',
    './resources/trees/pine.json',
    './resources/trees/commontree3.json',
];

const foliagePool = new GameObjectPool(foliagePath, () => {
    poolLoadedCount++;
    if (poolLoadedCount == poolCount) {
        startGame();
    }
});

const cloudsPath = [
    './resources/clouds/cloud1.json',
    './resources/clouds/cloud2.json',
    './resources/clouds/cloud3.json',
];

const cloudsPool = new GameObjectPool(cloudsPath, () => {
    poolLoadedCount++;
    if (poolLoadedCount == poolCount) {
        startGame();
    }
});

const audioPath = [
    './resources/audio/horseDeath.wav',
    './resources/audio/horseSnort.wav',
    './resources/audio/horseLanding.wav',
    './resources/audio/horseWalking.wav',
    './resources/audio/bensound-sunny.mp3'
];

const audioPool = new GameObjectPool(audioPath, () => {
    poolLoadedCount++;
    if (poolLoadedCount == poolCount) {
        startGame();
    }
}, true);

const listener = new THREE.AudioListener();
camera.add(listener);

document.getElementById("restart").onclick = function() {
    location.reload();
    gameOver = false;
}

document.getElementById("start-button").onclick = function() {
    gameStarted = true;
    controls.enabled = true;
    document.getElementById('start-game').classList.toggle('active');
    document.getElementById('container').classList.add('no-events');
}

var gameOver = false;

// camera.position.z = 5;

var deltaTime = 0;
var lastTime = 0;

const ground_movement_speed = 0.2;
var playerMovementSpeed = 12;

const animate = function (time) {
    requestAnimationFrame(animate);


    deltaTime = (time - lastTime) * 0.001;
    lastTime = time;

    if (gameStarted) {
        controls.update();
        document.getElementById("controls-disabled").style.display = !this.controls.enabled ? "flex" : "none";
        ground_texture.offset.x += deltaTime * ground_movement_speed * (playerMovementSpeed / 5);
        step(deltaTime);
    }

    renderer.render(scene, camera);
};

animate(0);

function step(deltaTime) {
    if (this.gameOver) {
        return;
    }

    stable.update(deltaTime);
    player.Update(deltaTime);
    world.Update(deltaTime);
    background.Update(deltaTime);
    if (player.gameOver && !this.gameOver) {
        this.gameOver = true;
        document.getElementById('game-over').classList.toggle('active');
        document.getElementById('game-over-score').innerHTML = "SCORE: " + Math.round(world.score);
    }
}

function startGame() {

    stable = new Stable(scene);

    world = new w.WorldManager({ scene: scene });

    player = new p.Player({ scene: scene, world: world });

    background = new b.Background({ scene: scene });

    // gameStarted = true;

    // setTimeout(() => {
        gameStarted = false;
        // controls.enabled = false;
    // }, 100);


    playSound('./resources/audio/bensound-sunny.mp3', true, 0.2)
}

function playSound(audioPath, loop = false, volume = 0.5) {
    const sound = new THREE.Audio(listener);
    const buffer = audioPool.getAsset(audioPath);
    sound.setBuffer(buffer);
    sound.setLoop(loop);
    sound.setVolume(volume);
    sound.play();
}
