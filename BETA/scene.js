// scene.js - Babylon.js Core Engine & Low-Luminosity Quicksilver Haze System

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
    scene.clearColor = new BABYLON.Color4(0.015, 0.02, 0.025, 1.0); // Obsidian quicksilver backdrop

    // Camera setup for 3D Quantum Space
    camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2.5, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 40;

    // Subdued ambient lighting to match dark PBR materials
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.35;
    hemiLight.groundColor = new BABYLON.Color3(0.02, 0.03, 0.04);

    // Initialize Low-Luminosity Mist System
    createQuicksilverMistParticles(scene);

    // Render Loop
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Resize Handler
    window.addEventListener("resize", () => {
        engine.resize();
    });
}

/* Low-Luminosity Ambient Quicksilver Mist System */
function createQuicksilverMistParticles(scene) {
    const mistSystem = new BABYLON.ParticleSystem("quicksilverMist", 180, scene);

    // Procedurally generated soft radial blur texture
    mistSystem.particleTexture = createSoftGlowTexture(scene);

    // Emitter volume spanning behind the UI layer
    mistSystem.emitter = new BABYLON.Vector3(0, 0, 0);
    mistSystem.minEmitBox = new BABYLON.Vector3(-15, -10, -6);
    mistSystem.maxEmitBox = new BABYLON.Vector3(15, 10, 2);

    // Standard alpha blending to prevent additive light blowout
    mistSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    
    // Low-Luminosity Color Gradients (Muted Steel -> Slate Grey -> Smoked Quicksilver -> Fade Out)
    mistSystem.addColorGradient(0.0, new BABYLON.Color4(0.08, 0.10, 0.14, 0.0));
    mistSystem.addColorGradient(0.25, new BABYLON.Color4(0.12, 0.15, 0.20, 0.08));
    mistSystem.addColorGradient(0.60, new BABYLON.Color4(0.15, 0.17, 0.22, 0.09));
    mistSystem.addColorGradient(0.85, new BABYLON.Color4(0.09, 0.11, 0.14, 0.04));
    mistSystem.addColorGradient(1.0, new BABYLON.Color4(0.02, 0.03, 0.04, 0.0));

    // Mist Scale & Lifetime
    mistSystem.minSize = 10.0;
    mistSystem.maxSize = 22.0;
    mistSystem.minLifeTime = 12.0;
    mistSystem.maxLifeTime = 24.0;

    // Low Emission Parameters
    mistSystem.emitRate = 8;
    mistSystem.minEmitPower = 0.01;
    mistSystem.maxEmitPower = 0.04;
    mistSystem.updateSpeed = 0.003;

    // Gentle Motion
    mistSystem.direction1 = new BABYLON.Vector3(-0.3, -0.1, -0.1);
    mistSystem.direction2 = new BABYLON.Vector3(0.3, 0.1, 0.1);
    mistSystem.minAngularSpeed = -0.01;
    mistSystem.maxAngularSpeed = 0.01;

    mistSystem.start();
}

/* Procedural Texture Generator for Low-Luminance Quicksilver Haze */
function createSoftGlowTexture(scene) {
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 256;
    texCanvas.height = 256;
    const ctx = texCanvas.getContext("2d");

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(180, 195, 210, 0.45)");
    gradient.addColorStop(0.3, "rgba(100, 115, 135, 0.20)");
    gradient.addColorStop(0.7, "rgba(35, 45, 55, 0.04)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    return new BABYLON.Texture(texCanvas.toDataURL(), scene);
}

document.addEventListener("DOMContentLoaded", initScene);
