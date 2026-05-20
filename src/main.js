// NEXUS Project - Developed by Agadagba Esther (2025-2026)
import './style.css'; // This tells Vite to load your CSS
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { buildingMap } from './location.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05080a);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
const birdsEye = { x: 500, y: 750, z: 500 };
camera.position.set(birdsEye.x, birdsEye.y, birdsEye.z);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#three-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.localClippingEnabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
scene.add(new THREE.AmbientLight(0xffffff, 2.5));

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

// --- GOOGLE FORM CONFIG ---
const GOOGLE_FORM_URL = "https://forms.gle/6hZ6KjCoergzyojE8";
const formBtn = document.getElementById('form-btn');
if (formBtn) formBtn.href = GOOGLE_FORM_URL;

// --- CUSTOM DROPDOWN ENGINE SET-UP ---
const dList = document.getElementById('building-options');
const searchInput = document.getElementById('nexus-search');
const arrowBtn = document.getElementById('dropdown-arrow');

// Populate custom dropdown list items using your exact source database structure
if (dList) {
    Object.values(buildingMap).forEach(data => {
        let li = document.createElement('li');
        li.innerText = data.displayName;
        
        li.addEventListener('click', () => {
            if (searchInput) searchInput.value = data.displayName;
            performSearch(data.displayName); // Triggers your original search perfectly!
            closeDropdown(); 
        });
        
        dList.appendChild(li);
    });
}

function openDropdownFull() {
    // 💡 Add this safety guard line
    if (!dList) return; 
    
    Array.from(dList.children).forEach(li => li.style.display = 'block');
    dList.style.display = 'block';
    if (arrowBtn) arrowBtn.classList.add('open');
}

function closeDropdown() {
    // 💡 Add this safety guard line
    if (!dList) return; 
    
    dList.style.display = 'none';
    if (arrowBtn) arrowBtn.classList.remove('open');
}

// --- ASSET LOADER LAYER ---
const loader = new GLTFLoader();
loader.load('./MYSchool_project9.glb', (gltf) => {
    campus = gltf.scene;
    campus.traverse(child => {
        originalPositions.set(child.name, child.position.clone());
    });
    scene.add(campus);
    const loadStatus = document.getElementById('load-status');
    if (loadStatus) loadStatus.innerText = "SYSTEM ONLINE";
});

function processSelection(data, point) {
    const panel = document.getElementById('side-panel');
    const toast = document.getElementById('marker-toast');
    if (panel) panel.classList.remove('active');

    // 1. Reset everything (Slicers/Lifters) before moving
    resetSurgically(() => {
        const tl = gsap.timeline();

        // 2. FIRST MOVE: Go to birdsEye view
        tl.to(camera.position, { 
            x: birdsEye.x, 
            y: birdsEye.y, 
            z: birdsEye.z, 
            duration: 1, 
            ease: "power2.inOut" 
        });

        // 3. SECOND MOVE: Fly to the building and move the focal point (controls.target)
        tl.to(camera.position, {
            x: point.x + 45, 
            y: point.y + 40, 
            z: point.z + 45,
            duration: 2.5, 
            ease: "power2.inOut",
            onStart: () => {
                // UI DETAILS UPDATE
                const viewName = document.getElementById('view-name');
                const viewDesc = document.getElementById('view-desc');
                if (viewName) viewName.innerText = data.displayName;
                if (viewDesc) viewDesc.innerText = data.description;
                if (panel) panel.classList.add('active');
                
                // Hide introductory notice box to clear workspace for the feedback form layout
                const campusNotice = document.querySelector('.campus-notice');
                if (campusNotice) campusNotice.style.display = 'none';
                
                // TARGET MARKER CONFIGURATION
                marker.position.set(point.x, point.y + 0.5, point.z); 
                marker.visible = true;
                
                // FLOATING TOAST LOGIC
                if (toast) {
                    toast.style.display = 'block';
                    setTimeout(() => toast.style.display = 'none', 5000);
                }
            }
        });

        // This ensures OrbitControls "look at" the specific building model origin perfectly
        tl.to(controls.target, {
            x: point.x, 
            y: point.y, 
            z: point.z,
            duration: 2.5, 
            onUpdate: () => controls.update() 
        }, "-=2.5"); 

        // 4. EXECUTE RIGGED BUILDING LIFTS/SLICES
        tl.add(() => executeBuildingAnimations(data, point), "-=1.5");

        // 5. ENGAGE FEEDBACK FRAMEWORK
        searchCount++;
        const feedbackPrompt = document.getElementById('feedback-prompt');
        if (searchCount && feedbackPrompt) {
            feedbackPrompt.style.display = 'block';
        }
    });
}

function executeBuildingAnimations(data, point) {
    if (data.toLift) {
        data.toLift.forEach(name => {
            const obj = scene.getObjectByName(name);
            if (obj) {
                currentlyLifted.push(obj);
                const home = originalPositions.get(obj.name);
                gsap.to(obj.position, { y: home.y + 30, duration: 2 });
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
        gsap.to(obj.position, { x: home.x, y: home.y, z: home.z, duration: 0.8, onComplete: () => {
            count++; if (count === currentlyLifted.length) { currentlyLifted = []; onDone(); }
        }});
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

// Toggle full dropdown via down arrow icon click
if (arrowBtn) {
    arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const sidePanel = document.getElementById('side-panel');
        if (sidePanel) sidePanel.classList.remove('active');
        
        if (dList && dList.style.display === 'block') {
            closeDropdown();
        } else {
            openDropdownFull();
        }
    });
}

if (searchInput) {
    // Open full options selection if clicking directly into an empty entry text block
    searchInput.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const sidePanel = document.getElementById('side-panel');
        if (sidePanel) sidePanel.classList.remove('active');
        
        if (searchInput.value.trim() === '') {
            openDropdownFull();
        }
    });

    // Execute lookup sequence when hitting manual keyboard Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const sidePanel = document.getElementById('side-panel');
            if (sidePanel) sidePanel.classList.remove('active');
            performSearch(e.target.value);
            closeDropdown();
        }
    });

    // Handle dynamic string matching suggestions on active input typing
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        let hasResults = false;

        const sidePanel = document.getElementById('side-panel');
        if (sidePanel) sidePanel.classList.remove('active');

        if (val === "") {
            openDropdownFull();
            return;
        }

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

// Dynamic blur handler out-of-bounds click listener dismisses dropdown menu automatically
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        closeDropdown();
    }
});

let mouseDownPos = new THREE.Vector2();

window.addEventListener('mousedown', (e) => {
    mouseDownPos.set(e.clientX, e.clientY);
});

// Raycasting interaction vector mapping
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

// --- CORE FRAME RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);
    if (marker.visible) {
        marker.rotation.y += 0.04;
        marker.position.y += Math.sin(Date.now() * 0.005) * 0.005;
    }
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});