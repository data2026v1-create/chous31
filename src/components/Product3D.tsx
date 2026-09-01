import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  ContactShadows,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";

/**
 * Modèle 3D de sneaker (GLTF public, utilisé dans les tutoriels R3F).
 * Alternative de repli si le premier CDN est indisponible.
 */
const MODEL_URLS = [
  "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/shoe/model.gltf",
  "https://raw.githubusercontent.com/pmndrs/market-assets/master/files/shoe.glb",
];

function ShoeModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

/** Rendu d'une scène 3D : une URL donnée à la fois */
function Scene({ url }: { url: string }) {
  return (
    <Suspense fallback={null}>
      <Bounds fit clip observe margin={1.15} key={url}>
        <ShoeModel url={url} />
      </Bounds>
      <ContactShadows position={[0, -1.35, 0]} opacity={0.4} scale={8} blur={2.6} far={3.2} />
    </Suspense>
  );
}

/** Signale la fin du chargement du modèle (hook drei) */
function ProgressReporter({ onLoaded }: { onLoaded: () => void }) {
  const { active } = useProgress();
  const done = useRef(false);
  useEffect(() => {
    if (!active && !done.current) {
      done.current = true;
      onLoaded();
    }
  }, [active, onLoaded]);
  return null;
}

/** Garde-fou : si le modèle ne peut pas être chargé, on informe le parent */
class ModelErrorBoundary extends Component<
  { onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface Product3DProps {
  onFail: () => void;
  onLoaded: () => void;
}

export default function Product3D({ onFail, onLoaded }: Product3DProps) {
  /* Essai du premier CDN, puis du second en cas d'échec */
  const [urlIndex, setUrlIndex] = useState(0);

  const tryNextUrl = useCallback(() => {
    setUrlIndex((i) => {
      if (i < MODEL_URLS.length - 1) return i + 1;
      onFail(); // plus aucune URL disponible
      return i;
    });
  }, [onFail]);

  const handleFail = useCallback(() => {
    if (urlIndex < MODEL_URLS.length - 1) {
      tryNextUrl();
    } else {
      onFail();
    }
  }, [urlIndex, onFail, tryNextUrl]);

  return (
    <ModelErrorBoundary onFail={handleFail}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0.4, 0.8, 5], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Éclairage studio */}
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[5, 7, 4]}
          intensity={2.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 3, -4]} intensity={0.7} color="#ffd9c2" />
        <spotLight position={[0, 5, 2]} intensity={0.5} angle={0.5} penumbra={1} color="#ffffff" />

        <Scene url={MODEL_URLS[urlIndex]} />

        <OrbitControls
          autoRotate
          autoRotateSpeed={1.7}
          enablePan={false}
          enableDamping
          minDistance={2.6}
          maxDistance={7.5}
          maxPolarAngle={Math.PI / 1.9}
          minPolarAngle={Math.PI / 4.5}
        />

        <ProgressReporter onLoaded={onLoaded} />
      </Canvas>
    </ModelErrorBoundary>
  );
}
