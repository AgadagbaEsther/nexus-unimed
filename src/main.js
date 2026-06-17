// NEXUS Project - Developed by Agadagba Esther (2025-2026)
import './style.css'; // This tells Vite to load your CSS
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';
import { buildingMap } from './location.js';

// --- 1. PROFESSIONAL THROTTLING ENGINE CONTROLS ---
let isModelReady = false; 

function handleLoadComplete() {
    const progressText = document.getElementById('nexus-loading-text');
    if (progressText) progressText.innerText = `Assembling NEXUS Environment... 100%`;

    const loaderElement = document.getElementById('loading-screen');
    const interfaceElement = document.getElementById('nexus-interface');

    // Smoothly fade away the blocker overlay
    if (loaderElement) {
        loaderElement.style.transition = 'opacity 0.5s ease-in-out';
        loaderElement.style.opacity = '0';
        setTimeout(() => loaderElement.remove(), 500);
    }

    // Activate and reveal the user interface safely without thread clashing
    if (interfaceElement) {
        interfaceElement.style.opacity = '1';
    }

    const loadStatus = document.getElementById('load-status');
    if (loadStatus) loadStatus.innerText = "SYSTEM ONLINE";

    // Set engine state to active and force awake interaction variables
    isModelReady = true;
    controls.enabled = true;
    controls.update();
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05080a);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
const birdsEye = { x: 500, y: 750, z: 500 };
camera.position.set(birdsEye.x, birdsEye.y, birdsEye.z);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#three-canvas'), antialias: true, powerPreference: "high-performance"});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.localClippingEnabled = true;

// 🛠️ FIX: Do not set controls.enabled to false here. Keep it active so the DOM hooks match up.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
scene.add(new THREE.AmbientLight(0xffffff, 2.5));

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 2000);
const marker = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.3, 0), 
    new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true })
);
marker.visible = false;
scene.add(marker);

let campus, searchCount = 0;
const originalPositions = new Map(); 
let currentlyLifted = [];
let currentlySliced = [];

// --- CUSTOM DROPDOWN ENGINE SET-UP ---
const dList = document.getElementById('building-options');
const searchInput = document.getElementById('nexus-search');
const arrowBtn = document.getElementById('dropdown-arrow');

if (dList) {
    Object.values(buildingMap).forEach(data => {
        let li = document.createElement('li');
        li.innerText = data.displayName;
        
        li.addEventListener('click', () => {
            if (searchInput) searchInput.value = data.displayName;
            performSearch(data.displayName); 
            closeDropdown(); 
        });
        
        dList.appendChild(li);
    });
}

function openDropdownFull() {
    if (!dList) return; 
    Array.from(dList.children).forEach(li => li.style.display = 'block');
    dList.style.display = 'block';
    if (arrowBtn) arrowBtn.classList.add('open');
}

function closeDropdown() {
    if (!dList) return; 
    dList.style.display = 'none';
    if (arrowBtn) arrowBtn.classList.remove('open');
}

// --- STREAMING PIPELINE ENTRY ---
loader.load('./MYSchool_project9.glb', (gltf) => {
    campus = gltf.scene;
    
    campus.position.x = -60; 
    campus.position.z = -20; 
    campus.rotation.y = Math.PI / 4; 

    scene.add(campus);
    
    campus.traverse(child => {
        if (child.name) {
            originalPositions.set(child.name, child.position.clone());
        }
    });

    // Asset parsing completed successfully, fire interface sequence safely
    handleLoadComplete();
}, 
function(xhr) {
    // 🛠️ FIX: Calculate real native loading percentages cleanly without guessing or clamping at 95%
    if (xhr.total > 0) {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        const progressText = document.getElementById('nexus-loading-text');
        if (progressText) progressText.innerText = `Assembling NEXUS Environment... ${percent}%`;
    }
},
function(error) {
    console.error('An error happened layout loading:', error);
});

// --- TIMED SEQUENTIAL UX SELECTION ENGINE ---
function processSelection(data, point) {
    const panel = document.getElementById('side-panel');
    const toggleBtn = document.getElementById('panel-toggle');
    const tooltip = document.getElementById('guide-tooltip');
    const toast = document.getElementById('marker-toast');

    if (panel) panel.classList.remove('active');
    if (toggleBtn) toggleBtn.classList.remove('open');
    if (tooltip) tooltip.classList.remove('show');

    resetSurgically(() => {
        // 🔒 FIX: Kill running camera tweens and completely release controls when timeline completes
        const tl = gsap.timeline({
            onComplete: () => {
                controls.enabled = true;
                controls.update();
            }
        });

        // 🔒 Temporarily freeze touch interactions during camera flight to prevent layout breaks
        controls.enabled = false;

        tl.to(camera.position, { 
            x: birdsEye.x, 
            y: birdsEye.y, 
            z: birdsEye.z, 
            duration: 1, 
            ease: "power2.inOut" 
        });

        tl.to(camera.position, {
            x: point.x + 45, 
            y: point.y + 40, 
            z: point.z + 45,
            duration: 2.5, 
            ease: "power2.inOut",
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
            }
        });

        tl.to(controls.target, {
            x: point.x, 
            y: point.y, 
            z: point.z,
            duration: 2.5, 
            ease: "power2.inOut", // Smooth interpolation easing parameter
            onUpdate: () => controls.update() 
        }, "-=2.5"); 

        tl.add(() => executeBuildingAnimations(data, point), "-=1.5");
    });
}

function executeBuildingAnimations(data, point) {
    if (data.toLift) {
        data.toLift.forEach(name => {
            const obj = scene.getObjectByName(name);
            if (obj) {
                currentlyLifted.push(obj);
                const home = originalPositions.get(obj.name);
                if (home) gsap.to(obj.position, { y: home.y + 30, duration: 2 });
            }
        });
    }

    if (data.useSlicer) {
        const targets = data.slicerTargets || (data.slicerTarget ? [data.slicerTarget] : []);
        targets.forEach(tName => {
            const root = scene.getObjectByName(tName);
            if (root) {
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
                let targetY = (data.sliceDepth) ? 
                    (new THREE.Box3().setFromObject(root).max.y - data.sliceDepth) : 
                    (point.y + (data.sliceOffset || 3.0));
                gsap.to(clipPlane, { constant: targetY, duration: 1.5 });
            }
        });
    }
}

function resetSurgically(onDone) {
    marker.visible = false;
    gsap.to(clipPlane, { constant: 2000, duration: 0.8 });
    currentlySliced.forEach(obj => { if (obj.material) obj.material.clippingPlanes = null; });
    currentlySliced = [];
    if (currentlyLifted.length === 0) { onDone(); return; }
    let count = 0;
    currentlyLifted.forEach(obj => {
        const home = originalPositions.get(obj.name);
        if (home) {
            gsap.to(obj.position, { x: home.x, y: home.y, z: home.z, duration: 0.8, onComplete: () => {
                count++; if (count === currentlyLifted.length) { currentlyLifted = []; onDone(); }
            }});
        } else {
            count++; if (count === currentlyLifted.length) { currentlyLifted = []; onDone(); }
        }
    });
}

function performSearch(query) {
    const val = query.toLowerCase().trim();
    const key = Object.keys(buildingMap).find(k => 
        k.toLowerCase() === val || buildingMap[k].displayName.toLowerCase().includes(val)
    );
    if (key) {
        const data = buildingMap[key];
        const targetObj = scene.getObjectByName(data.body || key); 
        if (targetObj) {
            const worldPos = new THREE.Vector3();
            targetObj.getWorldPosition(worldPos);
            processSelection(data, worldPos);
        }
    }
}

// --- INTERACTIVE EVENT CONTROL LAYERS ---
const toggleBtnNode = document.getElementById('panel-toggle');
const sidePanelNode = document.getElementById('side-panel');
const tooltipNode = document.getElementById('guide-tooltip');

if (toggleBtnNode && sidePanelNode) {
    toggleBtnNode.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (tooltipNode) tooltipNode.classList.remove('show'); 

        const isOpen = toggleBtnNode.classList.toggle('open');
        if (isOpen) {
            sidePanelNode.classList.add('active');
        } else {
            sidePanelNode.classList.remove('active');
        }
    });
}

if (arrowBtn) {
    arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (sidePanelNode) sidePanelNode.classList.remove('active');
        if (toggleBtnNode) toggleBtnNode.classList.remove('open');
        
        if (dList && dList.style.display === 'block') {
            closeDropdown();
        } else {
            openDropdownFull();
        }
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

        if (val === "") { openDropdownFull(); return; }

        if (dList) {
            Array.from(dList.children).forEach(li => {
                if (li.innerText.toLowerCase().includes(val)) {
                    li.style.display = 'block';
                    hasResults = true;
                } else {
                    li.style.display = 'none';
                }
            });
            if (hasResults) {
                dList.style.display = 'block';
                if (arrowBtn) arrowBtn.classList.add('open');
            } else {
                dList.style.display = 'none';
                if (arrowBtn) arrowBtn.classList.remove('open');
            }
        }
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) closeDropdown();
});

let mouseDownPos = new THREE.Vector2();
window.addEventListener('mousedown', (e) => { mouseDownPos.set(e.clientX, e.clientY); });

window.addEventListener('mouseup', (e) => {
    const mouseUpPos = new THREE.Vector2(e.clientX, e.clientY);
    const distance = mouseDownPos.distanceTo(mouseUpPos);

    if (distance < 5) {
        const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            let obj = intersects[0].object;
            let entry = buildingMap[obj.name] || buildingMap[obj.parent?.name];
            if (entry) {
                const worldPos = new THREE.Vector3();
                obj.getWorldPosition(worldPos);
                processSelection(entry, worldPos);
            }
        }
    }
});

// --- RENDER EXECUTION ENVIRONMENT ---
function animate() {
    requestAnimationFrame(animate);
    if (marker.visible) {
        marker.rotation.y += 0.04;
        marker.position.y += Math.sin(Date.now() * 0.005) * 0.005;
    }
    controls.update();
    renderer.render(scene, camera);
}
animate(); // Safely running on global runtime loop initialization

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function lockMobileViewport() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', lockMobileViewport);
window.addEventListener('orientationchange', lockMobileViewport);
lockMobileViewport();