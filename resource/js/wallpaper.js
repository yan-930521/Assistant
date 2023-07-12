import * as THREE from "three"
import { OrbitControls } from '../js/three-addon/OrbitControls.js'
//import * as POSTPROCESSING from 'postprocessing' node_modules\three\examples\jsm\controls\OrbitControls.js

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    stencil: false,
    depth: false,
    canvas: document.getElementById("canvas")
});
renderer.setSize(window.innerWidth, window.innerHeight);

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

class CustomSinCurve extends THREE.Curve {

    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {

        const tx = t * 3 - 1.5;
        const ty = Math.sin(2 * Math.PI * t);
        const tz = 0;

        return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
    }
}
/*
const geometry1 = new THREE.BoxGeometry( 1, 1, 1 );
const material1 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry1, material1 );
scene.add( cube );*/

//const path = new CustomSinCurve(10);
//const geometry = new THREE.TubeGeometry(path, 20, 2, 8, false);
const geometry2 = new THREE.CylinderGeometry(1, 1, 100, 64, 1, true);//(1, 1, 20, 12, 0, true);
const texture1 = new THREE.TextureLoader().load("../background/star-sky1.png")//

/*let textureVid = document.createElement("video");
textureVid.src = `./bonk.mp4`; // transform gif to mp4
textureVid.loop = true;
textureVid.play();


// Load video texture
const texture2 = new THREE.VideoTexture(textureVid);
texture2.format = THREE.RGBAFormat;
texture2.minFilter = THREE.NearestFilter;
texture2.maxFilter = THREE.NearestFilter;
texture2.generateMipmaps = false;
texture2.scale = 0.01;*/

const material1 = new THREE.MeshBasicMaterial({ //MeshStandardMaterial({
    //color: 0x00ff00,
    side: THREE.BackSide,
    map: texture1
});

material1.map.wrapS = THREE.RepeatWrapping
material1.map.wrapT = THREE.MirroredRepeatWrapping
material1.map.repeat.set(1, 1)

/*const material2 = new THREE.MeshBasicMaterial({ //MeshStandardMaterial({
    //color: 0x00ff00,
    side: THREE.BackSide,
    map: texture2
});

material2.map.wrapS = THREE.RepeatWrapping
material2.map.wrapT = THREE.RepeatWrapping
material2.map.repeat.set(20, 100)*/

const mesh = new THREE.Mesh(geometry2, material1);
//mesh.position.z = -0.28
//mesh.position.y = -0.02
scene.add(mesh);

const light = new THREE.SpotLight()
light.position.set(0, 0, 0)
scene.add(light)


camera.position.z = 0
camera.position.x = 0
camera.position.y = 20

//camera.lookAt(0, 0, 1)

mesh.flipSided = true

renderer.setSize(window.innerWidth, window.innerHeight)


// Repeat the pattern to prevent the texture being stretched
//material.map.wrapS = THREE.RepeatWrapping;
//material.map.wrapT = THREE.RepeatWrapping;
//material.map.repeat.set(30, 6);
/*
const sunMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})
// building the sphere geometry for the horizon
const sunGeometry = new THREE.SphereGeometry(0.25, 32, 32)
// baking the mesh with material and geometry
const sun = new THREE.Mesh(sunGeometry, sunMaterial)
//applying the postprocessing god rays effect to the horizon
const godRaysEffect = new POSTPROCESSING.GodRaysEffect(camera, sun , {
    height: 480,
    kernelSize: POSTPROCESSING.KernelSize.SMALL,
    density: 1.2,
    decay: 0.92,
    weight: 0.05,
    exposure: 5,
    samples: 60,
    clampMax: 1.0
})
// postprocessing effect pass instance
const effectPass = new POSTPROCESSING.EffectPass(
    camera,
    godRaysEffect
)
// enable effect pass
effectPass.renderToScreen = true
// we make the effect composer with the renderer itself !
const composer = new POSTPROCESSING.EffectComposer(renderer)
// postprocessing mandatory first render pass
composer.addPass(new POSTPROCESSING.RenderPass(scene, camera))
// postprocessing effect render pass
composer.addPass(effectPass);
*/
let t = 0;
let o = 1;
let lock = false;
function animate() {
    if (!lock) t += o;
    requestAnimationFrame(animate);
    // move forward the texture
    //console.log(t, 0.0010 + 0.0001 * (t % 200))
    material1.map.offset.y -= (0.0010 + 0.0001 * (t % 200));
    //material2.map.offset.y -= 2 * (0.0010 + 0.0001 * (t % 200));
    // rotation of the texture
    material1.map.offset.x -= (0.0010 + 0.00005 * (t % 200));
    // material2.map.offset.x -= 10 * (0.0010 + 0.00005 * (t % 200));

    if (!window.isPlayingVideo) {
        controls.update();
        //composer.render();
        renderer.render(scene, camera);
    }

    if ((t == 199 && o == 1) || (t == 5 && o == -1)) {
        o *= -1;
        lock = true;
        setTimeout(() => lock = false, 1000);
    }
}

animate();
