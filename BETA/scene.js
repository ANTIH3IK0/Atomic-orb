// scene.js - Babylon.js Core Engine & Dynamic Neon Fog Particle System

let canvas, engine, scene, camera;

function initScene() {
    canvas = document.getElementById("renderCanvas");
    if (!canvas) return;

    // Initialize WebGL Engine with transparency and anti-aliasing
    engine = new BABYLON.Engine(canvas, true, { 
        preserveDrawingBuffer: true, 
        stencil: true,
        alpha: true 
    });

    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.03, 1.0); // Deep obsidian background

    // Camera setup for 3D Quantum Space
    camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2.5, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 40;

    // Ambient Lighting
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;

    // Initialize Particle Systems
    createNeonFogParticles(scene);

    // Render Loop
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Resize Handler
    window.addEventListener("resize", () => {
        engine.resize();
    });
}

/* Dynamic Volumetric Neon Fog Particle System */
function createNeonFogParticles(scene) {
    // Particle Capacity for smooth performance
    const fogSystem = new BABYLON.ParticleSystem("neonFog", 250, scene);

    // Procedurally generated soft radial blur texture
    fogSystem.particleTexture = createSoftGlowTexture(scene);

    // Emitter volume spanning behind the UI layer
    fogSystem.emitter = new BABYLON.Vector3(0, 0, 0);
    fogSystem.minEmitBox = new BABYLON.Vector3(-15, -10, -6);
    fogSystem.maxEmitBox = new BABYLON.Vector3(15, 10, 2);

    // Additive blending for vivid glass refraction
    fogSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    
    // Color Gradients Over Lifetime (Cyan -> Deep Violet -> Magenta -> Fade Out)
    fogSystem.addColorGradient(0.0, new BABYLON.Color4(0.0, 0.8, 1.0, 0.0));
    fogSystem.addColorGradient(0.2, new BABYLON.Color4(0.0, 0.5, 1.0, 0.22));
    fogSystem.addColorGradient(0.5, new BABYLON.Color4(0.5, 0.0, 0.9, 0.30));
    fogSystem.addColorGradient(0.8, new BABYLON.Color4(1.0, 0.0, 0.5, 0.18));
    fogSystem.addColorGradient(1.0, new BABYLON.Color4(0.05, 0.0, 0.15, 0.0));

    // Fog Scale & Lifetime
    fogSystem.minSize = 8.0;
    fogSystem.maxSize = 16.0;
    fogSystem.minLifeTime = 10.0;
    fogSystem.maxLifeTime = 20.0;

    // Emission Parameters
    fogSystem.emitRate = 15;
    fogSystem.minEmitPower = 0.02;
    fogSystem.maxEmitPower = 0.1;
    fogSystem.updateSpeed = 0.005;

    // Gentle Organic Motion
    fogSystem.direction1 = new BABYLON.Vector3(-0.5, -0.2, -0.2);
    fogSystem.direction2 = new BABYLON.Vector3(0.5, 0.2, 0.2);
    fogSystem.minAngularSpeed = -0.02;
    fogSystem.maxAngularSpeed = 0.02;

    fogSystem.start();
}

/* Procedural Texture Generator for Soft Neon Orbs */
function createSoftGlowTexture(scene) {
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 256;
    texCanvas.height = 256;
    const ctx = texCanvas.getContext("2d");

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(0.25, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(0.65, "rgba(255, 255, 255, 0.08)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    return new BABYLON.Texture(texCanvas.toDataURL(), scene);
}

document.addEventListener("DOMContentLoaded", initScene);
