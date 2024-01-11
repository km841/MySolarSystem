import * as THREE from '../build/three.module.js';
import { OrbitControls } from "../examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "../examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "../examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "../examples/jsm/postprocessing/UnrealBloomPass.js"



class App {
    constructor() {
        const divContainer = document.querySelector("#webgl-container");
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer( {antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        //renderer.setClearColor(new THREE.Color('#21282a'), 1);
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;

        const scene = new THREE.Scene();
        this._scene = scene;

        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupParticles();
        this._setupController();

        window.onresize = this.resize.bind(this);
        this.resize();

        document.addEventListener('mousemove', this.animateParticles.bind(this));
        requestAnimationFrame(this.render.bind(this));

        this._mouseX = 0.0;
        this._mouseY = 0.0;
        this._clock = new THREE.Clock();
    }

    animateParticles(event) 
    {
        this._mouseY = event.clientY;
        this._mouseX = event.clientX;
    }

    _setupCamera() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            90,
            width / height,
            0.1,
            100
        );

        camera.position.z = 15;
        this._camera = camera;

        this._renderScene = new RenderPass(this._scene, this._camera);
        this._bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.6,
            0.4,
            0.4
        );
        this._composer = new EffectComposer(this._renderer);

        this._composer.addPass(this._renderScene);
        // this._composer.addPass(this._bloomPass);

        // this._renderer.toneMapping = THREE.CineonToneMapping;
        // this._renderer.toneMappingExposure = 1.5;

    }

    _setupLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 5.0);
        this._scene.add(ambientLight);
    }

    _setupModel() {
        const solarSystem = new THREE.Object3D();
        this._scene.add(solarSystem);

        const radius = 1;
        const widthSegments = 12;
        const heightSegments = 12;
        const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

        const textureLoader = new THREE.TextureLoader();

        const sunTexture = textureLoader.load('../examples/textures/sprites/sun.jpg');
        const sunMaterial = new THREE.MeshPhongMaterial(
            {
                map: sunTexture,
                emissive: 0xffff00, 
                emissiveIntensity: 0.2,
                flatShading: false
            }
        );

        const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
        sunMesh.scale.set(3, 3, 3);
        solarSystem.add(sunMesh);

        const earthOrbit = new THREE.Object3D();
        solarSystem.add(earthOrbit);

        const earthTexture = textureLoader.load('../examples/textures/sprites/earth.jpg');
        const earthMaterial = new THREE.MeshPhongMaterial(
            { 
                map: earthTexture,
                flatShading: false
            }
        );

        const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
        earthOrbit.position.x = 10;
        earthOrbit.add(earthMesh);

        const moonOrbit = new THREE.Object3D();
        moonOrbit.position.x = 2;
        earthOrbit.add(moonOrbit);

        const moonTexture = textureLoader.load('../examples/textures/sprites/moon.jpg');
        const moonMaterial = new THREE.MeshPhongMaterial(
            {map: moonTexture,
                flatShading: false}
        );
        
        const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
        moonMesh.scale.set(0.5, 0.5, 0.5);
        moonOrbit.add(moonMesh);

        this._solarSystem = solarSystem;
        this._earthOrbit = earthOrbit;
        this._moonOrbit = moonOrbit;
    }

    _setupParticles() {
        const particlesGeometry = new THREE.BufferGeometry;
        const particlesCnt = 50000;
        const posArray = new Float32Array(particlesCnt * 3);

        for (let i = 0; i < particlesCnt * 3; ++i)
        {
            posArray[i] = (Math.random() - 0.5) * 1000;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const textureLoader = new THREE.TextureLoader();
        const particleTexture = textureLoader.load('../examples/textures/sprites/cross.png');
        const partiocleMaterial = new THREE.PointsMaterial({
            map: particleTexture,
            size: 0.005,
            depthWrite: false,
            transparent: true,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, partiocleMaterial);
        
        const particle = new THREE.Object3D();
        particle.add(particlesMesh);
        particle.position.z = 0;
        this._scene.add(particle);
        this._particle = particle;
    }

    _setupController() {
        new OrbitControls(this._camera, this._divContainer);
    }

    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
    }

    render(time) {
        this._renderer.render(this._scene, this._camera);
        this.update(time);
        this._composer.render();
        requestAnimationFrame(this.render.bind(this));
    }

    update(time) {
        time *= 0.001;

        
        const elapsedTime = this._clock.getElapsedTime();
        
        this._particle.rotation.y = -0.1 * elapsedTime;

        this._particle.rotation.x = -this._mouseY * (elapsedTime * 0.00008);
        this._particle.rotation.y = -this._mouseX * (elapsedTime * 0.00008);
        this._solarSystem.rotation.y = time / 2;
        this._earthOrbit.rotation.y = time * 2;
        this._moonOrbit.rotation.y = time * 5;

        
    }

}

window.onload = function() {
    new App();
}