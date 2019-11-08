// global constants
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const gui = new dat.GUI();
const guiValues = new makeGuiValues();
const channelMeshes = [];


// create elements
const camControls = new THREE.OrbitControls(camera);
const ambientLight = new THREE.AmbientLight(0x404040);
const light = new THREE.DirectionalLight(0xffffff, 0.75);
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

for (let i = -8; i < 8; i++) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = i * 1.5;
  channelMeshes.push(cube);
  scene.add(cube);

}

// config
gui.close();
gui.add(guiValues, 'addHelpers');
gui.add(guiValues, 'orbitCam');
gui.addColor(guiValues, 'color');
// camera
camControls.enableDamping = true;
camControls.enabled = false;
camera.position.z = 28;
// light
light.position.x = 16;
light.position.y = 16;
light.position.z = 16;
// renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// add Audio
// create an AudioListener and add it to the camera
var listener = new THREE.AudioListener();
camera.add(listener);

// create a global audio source
this.sound = new THREE.Audio(listener);

// create an AudioAnalyser, passing in the sound and desired fftSize
var analyser = new THREE.AudioAnalyser(sound, 32);

document.body.addEventListener('click', function () {
  // load a sound and set it as the Audio object's buffer
  var audioLoader = new THREE.AudioLoader();
  audioLoader.load('media/bad-cat.mp3', function (buffer) {
    this.sound.setBuffer(buffer);
    this.sound.setLoop(true);
    this.sound.setVolume(0.5);
    this.sound.play();
  });
})


// add lighting
scene.add(light);
scene.add(ambientLight);

// add meshes to scene
// scene.add(cube);

// animation
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  setFromGui();
  camControls.update();
  // get the average frequency of the sound
  var data = analyser.getFrequencyData();
  // var dataAvg = analyser.getAverageFrequency();
  // console.log(data, dataAvg);
  for(let i = 0; i < channelMeshes.length; i++) {
    channelMeshes[i].position.y = data[i] * 0.04;
  }
  renderer.render(scene, camera);
}

function setFromGui() {
  const color = new THREE.Color(guiValues.color[0] / 255, guiValues.color[1] / 255, guiValues.color[2] / 255);
  if (!cube.material.color.equals(color)) {
    cube.material.color.setRGB(guiValues.color[0] / 255, guiValues.color[1] / 255, guiValues.color[2] / 255);
  }
  if (camControls.enabled !== guiValues.orbitCam) {
    camControls.enabled = guiValues.orbitCam;
  }
}

animate();

// add renderer to dom
document.body.appendChild(renderer.domElement);
window.onresize = onResize;

// gui functions 
function makeGuiValues() {
  this.color = [0, 255, 0];
  this.orbitCam = true;
  this.addHelpers = addHelpers;
};

function addHelpers() {
  const lightHelper = new THREE.DirectionalLightHelper(light, 4);
  scene.add(lightHelper);
}

// other functions
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}