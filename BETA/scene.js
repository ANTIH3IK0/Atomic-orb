// scene.js - Babylon.js Core Engine & Low-Luminosity Quicksilver Haze System

function initScene() {
    canvas = document.getElementById("renderCanvas");
    if (!canvas) return;

    engine = new BABYLON.Engine(canvas, true, { 
        preserveDrawingBuffer: true, 
        stencil: true,
        alpha: true 
    });

    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.015, 0.02, 0.025, 1.0);

    camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2.5, 12, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 40;

    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.35;
    hemiLight.groundColor = new BABYLON.Color3(0.02, 0.03, 0.04);

    createQuicksilverMistParticles(scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}

function createQuicksilverMistParticles(scene) {
    const mistSystem = new BABYLON.ParticleSystem("quicksilverMist", 120, scene);

    mistSystem.particleTexture = createSoftGlowTexture(scene);

    mistSystem.emitter = new BABYLON.Vector3(0, 0, 0);
    mistSystem.minEmitBox = new BABYLON.Vector3(-10, -6, -4);
    mistSystem.maxEmitBox = new BABYLON.Vector3(10, 6, 2);

    // Additive blending allows dark colors to show against dark backgrounds
    mistSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    
    // Muted Low-Luminosity Metallic Color Gradients
    mistSystem.addColorGradient(0.0, new BABYLON.Color4(0.0, 0.0, 0.0, 0.0));
    mistSystem.addColorGradient(0.3, new BABYLON.Color4(0.08, 0.12, 0.16, 0.25));
    mistSystem.addColorGradient(0.7, new BABYLON.Color4(0.05, 0.08, 0.12, 0.20));
    mistSystem.addColorGradient(1.0, new BABYLON.Color4(0.0, 0.0, 0.0, 0.0));

    mistSystem.minSize = 6.0;
    mistSystem.maxSize = 14.0;
    mistSystem.minLifeTime = 8.0;
    mistSystem.maxLifeTime = 16.0;

    mistSystem.emitRate = 12;
    mistSystem.minEmitPower = 0.01;
    mistSystem.maxEmitPower = 0.03;
    mistSystem.updateSpeed = 0.005;

    mistSystem.direction1 = new BABYLON.Vector3(-0.2, -0.1, -0.1);
    mistSystem.direction2 = new BABYLON.Vector3(0.2, 0.1, 0.1);

    mistSystem.start();
}

function createSoftGlowTexture(scene) {
    const dynTex = new BABYLON.DynamicTexture("mistTex", { width: 256, height: 256 }, scene, false);
    const ctx = dynTex.getContext();

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(180, 200, 220, 0.6)");
    gradient.addColorStop(0.3, "rgba(90, 110, 130, 0.25)");
    gradient.addColorStop(0.7, "rgba(20, 30, 40, 0.05)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    dynTex.update();

    return dynTex;
}

document.addEventListener("DOMContentLoaded", initScene);
