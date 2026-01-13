import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
    const ref = useRef<THREE.Points>(null);

    const particleCount = 2000;

    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, []);

    const colors = useMemo(() => {
        const cols = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const t = Math.random();
            // Blue to Purple gradient
            cols[i * 3] = 0.23 + t * 0.32; // R: 59-139 / 255
            cols[i * 3 + 1] = 0.51 - t * 0.15; // G: 130-92 / 255
            cols[i * 3 + 2] = 0.96 + t * 0.02; // B: 246 / 255
        }
        return cols;
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.02;
            ref.current.rotation.y = state.clock.elapsedTime * 0.03;
        }
    });

    return (
        <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                vertexColors
                size={0.05}
                sizeAttenuation
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

export default function ParticleBackground() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #fdf2f8 100%)' }}
            >
                <ambientLight intensity={0.5} />
                <ParticleField />
            </Canvas>
        </div>
    );
}
