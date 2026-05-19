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
    document.getElementById('form-btn').href = GOOGLE_FORM_URL;

    //scrollable datalist from location.js
    const dList = document.getElementById('building-options');
    Object.values(buildingMap).forEach(data => {
        let opt = document.createElement('option');
        opt.value = data.displayName;
        dList.appendChild(opt);
    });

    const loader = new GLTFLoader();
    loader.load('../MYSchool_project9.glb', (gltf) => {
        campus = gltf.scene;
        campus.traverse(child => {
            originalPositions.set(child.name, child.position.clone());
        });
        scene.add(campus);
        document.getElementById('load-status').innerText = "SYSTEM ONLINE";
    });

   function processSelection(data, point) {
    const panel = document.getElementById('side-panel');
    const toast = document.getElementById('marker-toast');
    panel.classList.remove('active');

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
        // I do these at the same time using the "-=2.5" offset
        tl.to(camera.position, {
            x: point.x + 45, 
            y: point.y + 40, 
            z: point.z + 45,
            duration: 2.5, 
            ease: "power2.inOut",
            onStart: () => {
                // UI UPDATES (Your logic)
                document.getElementById('view-name').innerText = data.displayName;
                document.getElementById('view-desc').innerText = data.description;
                panel.classList.add('active');
                
                // MARKER SETUP
                marker.position.set(point.x, point.y + 0.5, point.z); 
                marker.visible = true;
                
                // TOAST SETUP
                toast.style.display = 'block';
                setTimeout(() => toast.style.display = 'none', 5000);
            }
        });

        // This ensures the OrbitControls "look at" the building perfectly
        tl.to(controls.target, {
            x: point.x, 
            y: point.y, 
            z: point.z,
            duration: 2.5, 
            onUpdate: () => controls.update() 
        }, "-=2.5"); // Starts at the same time as the camera position move

        // 4. TRIGGER ANIMATIONS
        tl.add(() => executeBuildingAnimations(data, point), "-=1.5");

        // 5. FEEDBACK LOGIC
        searchCount++;
        if (searchCount) {
            document.getElementById('feedback-prompt').style.display = 'block';
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

const searchInput = document.getElementById('nexus-search');

// ONLY trigger on Enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch(e.target.value);
});

// ONLY trigger on selecting from the list (prevents auto-trigger while typing/deleting)
searchInput.addEventListener('change', (e) => {
    const val = e.target.value;
    const exists = Object.values(buildingMap).some(data => data.displayName === val);
    
    // This only fires when the user finishes selecting an option or clicks away
    if (exists) {
        performSearch(val);
        searchInput.blur(); 
    }
});

   let mouseDownPos = new THREE.Vector2();

    // 1. Record where the mouse starts pressing down
    window.addEventListener('mousedown', (e) => {
        mouseDownPos.set(e.clientX, e.clientY);
    });

    // 2. Only perform selection if the mouse didn't move much (a real click)
    window.addEventListener('mouseup', (e) => {
        const mouseUpPos = new THREE.Vector2(e.clientX, e.clientY);
        const distance = mouseDownPos.distanceTo(mouseUpPos);

        // If distance is less than 5 pixels, it's a click, not a drag/rotate
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