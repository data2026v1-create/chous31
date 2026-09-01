import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Visualiseur 3D du produit — implémenté en THREE.js PUR (sans
 * react-three-fiber ni drei) pour une compatibilité totale avec
 * React 19 et éviter tout risque de plantage au chargement.
 *
 * - Modèle GLTF de sneaker chargé depuis un CDN public
 *   (+ URL de secours en cas d'échec).
 * - Rotation interactive + zoom (OrbitControls).
 * - Ombres portées + ombre de contact au sol.
 * - Si le chargement échoue (hors-ligne, WebGL désactivé…),
 *   la fiche produit bascule automatiquement sur les photos.
 */
const MODEL_URLS = [
  "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/shoe/model.gltf",
  "https://raw.githubusercontent.com/pmndrs/market-assets/master/files/shoe.glb",
];

interface Product3DProps {
  onFail: () => void;
  onLoaded: () => void;
}

export default function Product3D({ onFail, onLoaded }: Product3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onFailRef = useRef(onFail);
  const onLoadedRef = useRef(onLoaded);
  onFailRef.current = onFail;
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ---------- Renderer WebGL (garde-fou : pas de WebGL → photos) ---------- */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      onFailRef.current();
      return;
    }

    const initialW = mount.clientWidth || 1;
    const initialH = mount.clientHeight || 1;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(initialW, initialH);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    /* ---------- Scène & caméra ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, initialW / initialH, 0.1, 100);
    camera.position.set(0.4, 0.9, 5.2);

    /* ---------- Éclairage studio ---------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(5, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    key.shadow.bias = -0.0004;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xffd9c2, 0.8);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    const spot = new THREE.SpotLight(0xffffff, 0.6, 20, Math.PI / 4, 1);
    spot.position.set(0, 5, 2);
    scene.add(spot);

    /* ---------- Ombre de contact au sol ---------- */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.35;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ---------- Contrôles (rotation + zoom + auto-rotation) ---------- */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.05, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.7;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 2.6;
    controls.maxDistance = 7.5;
    controls.minPolarAngle = Math.PI / 4.5;
    controls.maxPolarAngle = Math.PI / 1.9;

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    /* ---------- Responsive ---------- */
    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(mount);

    /* ---------- Chargement du modèle (avec URL de secours) ---------- */
    const loader = new GLTFLoader();
    let model: THREE.Object3D | null = null;
    let disposed = false;

    const loadIndex = (index: number) => {
      if (disposed) return;
      if (index >= MODEL_URLS.length) {
        onFailRef.current();
        return;
      }
      loader.load(
        MODEL_URLS[index],
        (gltf) => {
          if (disposed) return;
          model = gltf.scene;

          /* Mise à l'échelle + centrage + pose au sol */
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const scale = 2.1 / maxDim;
          model.scale.setScalar(scale);
          model.position.y = -1.35 - box.min.y * scale;

          model.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (mesh.isMesh) {
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          scene.add(model);
          onLoadedRef.current();
        },
        undefined,
        (err) => {
          // Premier CDN indisponible → on essaie le suivant
          console.warn("[StepStore] Modèle 3D indisponible :", err);
          loadIndex(index + 1);
        }
      );
    };
    loadIndex(0);

    /* ---------- Nettoyage complet ---------- */
    return () => {
      disposed = true;
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mat = mesh.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
