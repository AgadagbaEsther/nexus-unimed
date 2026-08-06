// NEXUS Project - Developed by Agadagba Esther (2025-2026)

import './style.css';
import { buildingMap } from './location.js';

// --- SHARED STATE (populated once the 3D engine finishes initializing) ---
let scene, camera, renderer, controls, campus, clipPlane, marker, THREE, gsap;
let isModelReady = false;
let searchCount = 0;
const originalPositions = new Map();
let currentlyLifted = [];
let currentlySliced = [];

// --- DOM REFERENCES (safe to grab immediately) ---
const dList = document.getElementById('building-options');
const searchInput = document.getElementById('nexus-search');
const arrowBtn = document.getElementById('dropdown-arrow');
const toggleBtnNode = document.getElementById('panel-toggle');
const sidePanelNode = document.getElementById('side-panel');
const tooltipNode = document.getElementById('guide-tooltip');

// ---------------------------------------------------------------------
// 1. LIGHTWEIGHT UI THAT DOESN'T NEED THE 3D ENGINE
//    (runs immediately, keeps the page interactive fast)
// ---------------------------------------------------------------------
if (dList) {
    const frag = document.createDocumentFragment();
    Object.values(buildingMap).forEach(data => {
        const li = document.createElement('li');
        li.innerText = data.displayName;
        li.addEventListener('click', () => {
            if (searchInput) searchInput.value = data.displayName;
            performSearch(data.displayName);
            closeDropdown();
        });
        frag.appendChild(li);
    });
    dList.appendChild(frag);
}

function openDropdownFull() {
    if (!dList) return;
    Array.from(dList.children).forEach(li => (li.style.display = 'block'));
    dList.style.display = 'block';
    if (arrowBtn) arrowBtn.classList.add('open');
}

function closeDropdown() {
    if (!dList) return;
    dList.style.display = 'none';
    if (arrowBtn) arrowBtn.classList.remove('open');
}

if (arrowBtn) {
    arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidePanelNode) sidePanelNode.classList.remove('active');
        if (toggleBtnNode) toggleBtnNode.classList.remove('open');
        if (dList && dList.style.display === 'block') closeDropdown();
        else openDropdownFull();
    });
}

if (toggleBtnNode && sidePanelNode) {
    toggleBtnNode.addEventListener('click', (e) => {
        e.stopPropagation();
        if (tooltipNode) tooltipNode.classList.remove('show');
        const isOpen = toggleBtnNode.classList.toggle('open');
        sidePanelNode.classList.toggle('active', isOpen);
    });
}

if (searchInput) {
    searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidePanelNode) sidePanelNode.classList.remove('active');
        if (toggleBtnNode) toggleBtnNode.classList.remove('open');
        if (searchInput.value.trim() === '') openDropdownFull();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (sidePanelNode) sidePanelNode.classList.remove('active');
            if (toggleBtnNode) toggleBtnNode.classList.remove('open');
            performSearch(e.target.value);
            closeDropdown();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        let hasResults = false;
        if (sidePanelNode) sidePanelNode.classList.remove('active');
        if (toggleBtnNode) toggleBtnNode.classList.remove('open');

        if (val === '') { openDropdownFull(); return; }

        if (dList) {
            Array.from(dList.children).forEach(li => {
                const match = li.innerText.toLowerCase().includes(val);
                li.style.display = match ? 'block' : 'none';
                if (match) hasResults = true;
            });
            dList.style.display = hasResults ? 'block' : 'none';
            if (arrowBtn) arrowBtn.classList.toggle('open', hasResults);
        }
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) closeDropdown();
});

// ---------------------------------------------------------------------
// 2. SEARCH / SELECTION ENTRY POINT
//    Safe to call before the engine is ready — it just no-ops.
// ---------------------------------------------------------------------
function performSearch(query) {
    if (!isModelReady) return; // engine not loaded yet, ignore
    const val = query.toLowerCase().trim();
    const key = Object.keys(buildingMap).find(
        k => k.toLowerCase() === val || buildingMap[k].displayName.toLowerCase().includes(val)
    );
    if (!key) return;
    const data = buildingMap[key];
    const targetObj = scene.getObjectByName(data.body || key);
    if (!targetObj) return;
    const worldPos = new THREE.Vector3();
    targetObj.getWorldPosition(worldPos);
    processSelection(data, worldPos);
}

// ---------------------------------------------------------------------
// YIELD-TO-MAIN HELPER
// ---------------------------------------------------------------------
function yieldToMain() {
    if ('scheduler' in window && 'yield' in window.scheduler) {
        return window.scheduler.yield();
    }
    return new Promise((resolve) => setTimeout(resolve, 0));
}

// ---------------------------------------------------------------------
// 3. HEAVY 3D ENGINE — loaded + initialized during idle time
// ---------------------------------------------------------------------
function whenIdle(fn) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(fn, { timeout: 2000 });
    } else {
        setTimeout(fn, 200);
    }
}

whenIdle(initEngine);

async function initEngine() {
    // Dynamic imports = separate chunks, not parsed/executed until now.
    const [threeMod, gltfMod, orbitMod, dracoMod, gsapMod] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/controls/OrbitControls.js'),
        import('three/examples/jsm/loaders/DRACOLoader.js'),
        import('gsap'),
    ]);

    THREE = threeMod;
    gsap = gsapMod.default;
    const { GLTFLoader } = gltfMod;
    const { OrbitControls } = orbitMod;
    const { DRACOLoader } = dracoMod;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05080a);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    const birdsEye = { x: 500, y: 750, z: 500 };
    camera.position.set(birdsEye.x, birdsEye.y, birdsEye.z);

    await yieldToMain(); // let the browser breathe before renderer/WebGL-context creation

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#three-canvas'),
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.localClippingEnabled = true;

    await yieldToMain();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new THREE.AmbientLight(0xffffff, 2.5));

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 2000);
    marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.3, 0),
        new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true })
    );
    marker.visible = false;
    scene.add(marker);

    await yieldToMain(); // one more breath before kicking off the model fetch/parse

    // Throttle progress text updates to animation frames instead of every
    // single progress event (some browsers fire these very rapidly).
    let progressRAF = null;
    loader.load(
        './MYSchool_project9.glb',
        async (gltf) => {
            campus = gltf.scene;
            campus.position.x = -60;
            campus.position.z = -20;
            campus.rotation.y = Math.PI / 4;
            scene.add(campus);

            // Chunk the traversal instead of doing it as one single pass.
            // On a model with many nodes, walking + cloning position data
            // for every one of them in one go can itself be a long task.
            // Collecting into an array first lets us process it in small
            // batches with a yield between each, so no single task blocks
            // the main thread for long.
            const allNodes = [];
            campus.traverse(child => allNodes.push(child));

            const BATCH_SIZE = 200;
            for (let i = 0; i < allNodes.length; i += BATCH_SIZE) {
                const batch = allNodes.slice(i, i + BATCH_SIZE);
                for (const child of batch) {
                    if (child.name) originalPositions.set(child.name, child.position.clone());
                }
                if (i + BATCH_SIZE < allNodes.length) await yieldToMain();
            }

            await yieldToMain();

            // Precompile all shaders/materials for the loaded scene up front.
            // Without this, the FIRST time renderer.render() actually draws
            // this scene, the GPU driver has to compile every shader on the
            // spot — a classic three.js cause of a single large "long task"
            // right when the model appears. compileAsync does that work
            // ahead of time instead, so the first real frame is cheap.
            if (renderer.compileAsync) {
                await renderer.compileAsync(scene, camera);
            } else {
                renderer.compile(scene, camera);
                await yieldToMain();
            }

            handleLoadComplete(birdsEye);
        },
        (xhr) => {
            if (xhr.total > 0 && !progressRAF) {
                progressRAF = requestAnimationFrame(() => {
                    const percent = Math.round((xhr.loaded / xhr.total) * 100);
                    const progressText = document.getElementById('nexus-loading-text');
                    if (progressText) progressText.innerText = `Assembling NEXUS Environment... ${percent}%`;
                    progressRAF = null;
                });
            }
        },
        (error) => console.error('An error happened loading the model:', error)
    );

    setupPointerEvents();
    setupResize();
    startRenderLoop();
}

function handleLoadComplete() {
    const progressText = document.getElementById('nexus-loading-text');
    if (progressText) progressText.innerText = 'Assembling NEXUS Environment... 100%';

    const loaderElement = document.getElementById('loading-screen');
    const interfaceElement = document.getElementById('nexus-interface');

    if (loaderElement) {
        loaderElement.style.transition = 'opacity 0.5s ease-in-out';
        loaderElement.style.opacity = '0';
        setTimeout(() => loaderElement.remove(), 500);
    }
    if (interfaceElement) interfaceElement.style.opacity = '1';

    const loadStatus = document.getElementById('load-status');
    if (loadStatus) loadStatus.innerText = 'SYSTEM ONLINE';

    isModelReady = true;
    controls.enabled = true;
    controls.update();
    requestRender();
}

function processSelection(data, point) {
    const panel = document.getElementById('side-panel');
    const toggleBtn = document.getElementById('panel-toggle');
    const tooltip = document.getElementById('guide-tooltip');
    const toast = document.getElementById('marker-toast');

    if (panel) panel.classList.remove('active');
    if (toggleBtn) toggleBtn.classList.remove('open');
    if (tooltip) tooltip.classList.remove('show');

    const birdsEye = { x: 500, y: 750, z: 500 };

    resetSurgically(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                controls.enabled = true;
                controls.update();
            },
        });

        controls.enabled = false;

        tl.to(camera.position, { x: birdsEye.x, y: birdsEye.y, z: birdsEye.z, duration: 1, ease: 'power2.inOut', onUpdate: requestRender });

        tl.to(camera.position, {
            x: point.x + 45,
            y: point.y + 40,
            z: point.z + 45,
            duration: 2.5,
            ease: 'power2.inOut',
            onUpdate: requestRender,
            onStart: () => {
                const viewName = document.getElementById('view-name');
                const viewDesc = document.getElementById('view-desc');
                if (viewName) viewName.innerText = data.displayName;
                if (viewDesc) viewDesc.innerText = data.description;

                const campusNotice = document.querySelector('.campus-notice');
                if (campusNotice) campusNotice.style.display = 'none';

                marker.position.set(point.x, point.y + 0.5, point.z);
                marker.visible = true;

                if (searchCount < 3 && toast) {
                    toast.style.display = 'block';
                    setTimeout(() => { toast.style.display = 'none'; }, 3000);
                } else if (toast) {
                    toast.style.display = 'none';
                }
            },
            onComplete: () => {
                searchCount++;
                if (searchCount <= 2 && tooltip) {
                    setTimeout(() => {
                        if (toggleBtn && !toggleBtn.classList.contains('open')) {
                            tooltip.classList.add('show');
                            setTimeout(() => tooltip.classList.remove('show'), 5500);
                        }
                    }, 2200);
                }
            },
        });

        tl.to(controls.target, {
            x: point.x,
            y: point.y,
            z: point.z,
            duration: 2.5,
            ease: 'power2.inOut',
            onUpdate: () => { controls.update(); requestRender(); },
        }, '-=2.5');

        tl.add(() => executeBuildingAnimations(data, point), '-=1.5');
    });
}

function executeBuildingAnimations(data, point) {
    if (data.toLift) {
        data.toLift.forEach(name => {
            const obj = scene.getObjectByName(name);
            if (obj) {
                currentlyLifted.push(obj);
                const home = originalPositions.get(obj.name);
                if (home) gsap.to(obj.position, { y: home.y + 30, duration: 2, onUpdate: requestRender });
            }
        });
    }

    if (data.useSlicer) {
        const targets = data.slicerTargets || (data.slicerTarget ? [data.slicerTarget] : []);
        targets.forEach(tName => {
            const root = scene.getObjectByName(tName);
            if (!root) return;
            root.updateMatrixWorld(true);
            root.traverse(child => {
                if (child.isMesh) {
                    currentlySliced.push(child);
                    if (!child.userData.originalMat) {
                        child.userData.originalMat = child.material;
                        child.material = child.material.clone();
                    }
                    child.material.clippingPlanes = [clipPlane];
                }
            });
            const targetY = data.sliceDepth
                ? new THREE.Box3().setFromObject(root).max.y - data.sliceDepth
                : point.y + (data.sliceOffset || 3.0);
            gsap.to(clipPlane, { constant: targetY, duration: 1.5, onUpdate: requestRender });
        });
    }
}

function resetSurgically(onDone) {
    marker.visible = false;
    requestRender(); // marker just got hidden — needs one more frame to reflect that
    gsap.to(clipPlane, { constant: 2000, duration: 0.8, onUpdate: requestRender });
    currentlySliced.forEach(obj => { if (obj.material) obj.material.clippingPlanes = null; });
    currentlySliced = [];

    if (currentlyLifted.length === 0) { onDone(); return; }

    let count = 0;
    currentlyLifted.forEach(obj => {
        const home = originalPositions.get(obj.name);
        const finish = () => {
            count++;
            if (count === currentlyLifted.length) { currentlyLifted = []; onDone(); }
        };
        if (home) {
            gsap.to(obj.position, { x: home.x, y: home.y, z: home.z, duration: 0.8, onUpdate: requestRender, onComplete: finish });
        } else {
            finish();
        }
    });
}

// ---------------------------------------------------------------------
// 4. POINTER / RESIZE / RENDER LOOP
// ---------------------------------------------------------------------
function setupPointerEvents() {
    const mouseDownPos = new THREE.Vector2();
    window.addEventListener('mousedown', (e) => { mouseDownPos.set(e.clientX, e.clientY); }, { passive: true });

    window.addEventListener('mouseup', (e) => {
        const mouseUpPos = new THREE.Vector2(e.clientX, e.clientY);
        if (mouseDownPos.distanceTo(mouseUpPos) >= 5) return;

        const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            const entry = buildingMap[obj.name] || buildingMap[obj.parent?.name];
            if (entry) {
                const worldPos = new THREE.Vector3();
                obj.getWorldPosition(worldPos);
                processSelection(entry, worldPos);
            }
        }
    }, { passive: true });
}

function setupResize() {
    let resizeTimer = null;
    const doResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        lockMobileViewport();
    };

    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(doResize, 100);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    lockMobileViewport();
}

function lockMobileViewport() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set from startRenderLoop(); GSAP tween onUpdate hooks call this to flag
// that a frame needs to be rendered.
let requestRender = () => {};

function startRenderLoop() {
    let isVisible = !document.hidden;
    let needsRender = true;

    requestRender = () => { needsRender = true; };


    function tick() {
        if (!isVisible) return; // fully stops when tab is hidden

        requestAnimationFrame(tick);

        if (marker.visible) {
            marker.rotation.y += 0.04;
            marker.position.y += Math.sin(Date.now() * 0.005) * 0.005;
            needsRender = true;
        }

        // controls.update() is cheap math (no GPU work) and must run every
        // frame for damping to interpolate smoothly. It returns true while
        // the camera is still settling from a drag/zoom.
        const stillMoving = controls.update();
        if (stillMoving) needsRender = true;

        if (needsRender) {
            renderer.render(scene, camera);
            needsRender = false;
        }
    }

    // Any drag, zoom, or pan fires 'change' on controls — flag a render.
    controls.addEventListener('change', requestRender);

    document.addEventListener('visibilitychange', () => {
        const wasHidden = !isVisible;
        isVisible = !document.hidden;
        if (isVisible && wasHidden) {
            needsRender = true;
            requestAnimationFrame(tick);
        }
    });

    requestAnimationFrame(tick);
}