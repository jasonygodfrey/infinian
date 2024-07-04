import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

// Define the shader with transitions between multiple effects
const StarShader = shaderMaterial(
  { time: 0, opacity: 1.0, transparent: true },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float time;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0; 
    float px = 0.01;
    uv = vec2(px * floor(uv.x / px), px * floor(uv.y / px));

    float stage = mod(time / 10.0, 23.0);

    vec3 color;

    if (stage < 1.0) {
      // Stage 1: RGB cyberpunk effect
      float pattern = abs(sin(uv.x * 10.0 + time) * cos(uv.y * 10.0 + time));
      float r = 0.5 + 0.5 * sin(time + uv.x + uv.y + pattern);
      float g = 0.5 + 0.5 * cos(time + 2.0 + uv.x + uv.y + pattern);
      float b = 0.5 + 0.5 * sin(time + 4.0 + uv.x + uv.y - pattern);
      vec2 grid = mod(vUv * 5000.0, 1.5);
      float line = smoothstep(0.98, 1.0, grid.x) * smoothstep(0.98, 1.0, grid.y);
      float glow = smoothstep(0.2, 0.0, length(uv - vec2(sin(time * 0.1), cos(time * 0.15))));
      color = vec3(r, g, b) * line * (0.7 + 0.3 * glow);
    } else if (stage < 2.0) {
      // Stage 2: Sacred geometry pattern
      float radius = length(uv);
      float angle = atan(uv.y, uv.x);
      float sacredPattern = abs(sin(10.0 * angle + time) * cos(10.0 * radius + time));
      color = vec3(sacredPattern);
    } else if (stage < 3.0) {
      // Stage 3: Solid white pattern
      float gridSize = 10.0;
      vec2 gridUV = floor(uv * gridSize) / gridSize;
      float checker = mod(floor(gridUV.x) + floor(gridUV.y), 2.0);
      color = mix(vec3(1.0), vec3(0.0), checker);
    } else if (stage < 4.0) {
      // Stage 4: Radial gradient
      float radius = length(uv);
      color = vec3(radius);
    } else if (stage < 5.0) {
      // Stage 5: Sin wave distortion
      uv.x += sin(uv.y * 10.0 + time) * 0.1;
      uv.y += cos(uv.x * 10.0 + time) * 0.1;
      color = vec3(uv.x, uv.y, 1.0 - uv.x * uv.y);
    } else if (stage < 6.0) {
      // Stage 6: Circular waves
      float radius = length(uv);
      color = vec3(sin(radius * 10.0 - time), cos(radius * 10.0 - time), sin(radius * 5.0 - time));
    } else if (stage < 7.0) {
      // Stage 7: Noise effect
      float noise = random(uv + time);
      color = vec3(noise);
    } else if (stage < 8.0) {
      // Stage 8: Vertical stripes
      color = vec3(smoothstep(0.45, 0.55, abs(sin(uv.x * 20.0 + time))));
    } else if (stage < 9.0) {
      // Stage 9: Horizontal stripes
      color = vec3(smoothstep(0.45, 0.55, abs(sin(uv.y * 20.0 + time))));
    } else if (stage < 10.0) {
      // Stage 10: Diagonal lines
      float lines = abs(sin((uv.x + uv.y) * 20.0 + time));
      color = vec3(lines);
    } else if (stage < 11.0) {
      // Stage 11: Checkerboard pattern
      float checker = mod(floor(uv.x * 10.0) + floor(uv.y * 10.0), 2.0);
      color = vec3(checker);
    } else if (stage < 12.0) {
      // Stage 12: Spiral pattern
      float angle = atan(uv.y, uv.x);
      float spiral = sin(angle * 10.0 + length(uv) * 10.0 - time);
      color = vec3(spiral);
    } else if (stage < 13.0) {
      // Stage 13: Radial lines
      float angle = atan(uv.y, uv.x);
      color = vec3(sin(angle * 10.0 - time));
    } else if (stage < 14.0) {
      // Stage 14: Zoom effect
      float zoom = length(uv) * 10.0;
      color = vec3(sin(zoom - time), cos(zoom - time), sin(zoom * 0.5 - time));
    } else if (stage < 15.0) {
      // Stage 15: Wave grid
      float wave = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time);
      color = vec3(wave);
    } else if (stage < 16.0) {
      // Stage 16: Moving grid
      vec2 grid = mod(uv * 10.0 + vec2(sin(time), cos(time)), 1.0);
      float line = smoothstep(0.45, 0.55, grid.x) * smoothstep(0.45, 0.55, grid.y);
      color = vec3(line);
    } else if (stage < 17.0) {
      // Stage 17: Pulsating dots
      vec2 grid = mod(uv * 10.0, 1.0);
      float dist = length(grid - 0.5);
      color = vec3(smoothstep(0.1, 0.15, dist * sin(time)));
    } else if (stage < 18.0) {
      // Stage 18: Kaleidoscope effect
      float angle = atan(uv.y, uv.x);
      float radius = length(uv);
      color = vec3(sin(angle * 6.0 + time) * cos(radius * 10.0));
    } else if (stage < 19.0) {
      // Stage 19: Plasma effect
      float plasma = sin(uv.x * 10.0 + time) + sin(uv.y * 10.0 + time);
      color = vec3(plasma);
    } else if (stage < 20.0) {
      // Stage 20: Random noise
      color = vec3(random(uv + time));
    } else if (stage < 21.0) {
      // Stage 21: Vortex effect
      float angle = atan(uv.y, uv.x);
      float radius = length(uv);
      float vortex = sin(angle * 10.0 + radius * 5.0 - time);
      color = vec3(vortex);
    } else if (stage < 22.0) {
      // Stage 22: Hexagon pattern
      vec3 hex = vec3(mod(uv.x + uv.y, 0.5) * 2.0);
      color = hex;
    } else {
      // Stage 23: Moving triangles
      vec2 grid = mod(uv * 10.0 + vec2(sin(time), cos(time)), 1.0);
      float tri = smoothstep(0.45, 0.55, abs(grid.x - grid.y));
      color = vec3(tri);
    }

    gl_FragColor = vec4(color, 0.5); // 50% transparency
  }
  `
);

extend({ StarShader });

const Model = () => {
  const gltf = useGLTF('/infinian_lineage_series/scene.gltf');
  const { ref, mixer, clips } = useAnimations(gltf.animations, gltf.scene);
  const [activeClip, setActiveClip] = useState(0);

  useEffect(() => {
    gltf.scene.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({ color: 'white', wireframe: true });
      }
    });

    const playNextAnimation = () => {
      const action = mixer.clipAction(clips[activeClip], ref.current);
      action.reset().play();
      action.timeScale = 0.3; // Set this to control the speed of the animation

      const handleComplete = () => {
        setActiveClip((prevClip) => (prevClip + 1) % clips.length);
      };

      action.loop = THREE.LoopOnce;
      action.clampWhenFinished = true; // Ensure the animation stops at the last frame
      action.paused = false; // Ensure the animation is not paused
      mixer.addEventListener('finished', handleComplete);

      return () => {
        mixer.removeEventListener('finished', handleComplete);
      };
    };

    playNextAnimation();
  }, [activeClip, clips, mixer, ref]);

  useFrame((state, delta) => mixer.update(delta));

  return <primitive object={gltf.scene} ref={ref} scale={[1, 1, 1]} position={[0, -6, -7]} />;
};

const LCDScreen = () => {
  const materialRef = useRef();
  useFrame(({ clock }) => {
    materialRef.current.uniforms.time.value = clock.getElapsedTime();
  });

  return (
    <Plane args={[50, 50]} position={[0, 0, -2]}>
      <starShader attach="material" ref={materialRef} />
    </Plane>
  );
};

const Scene = () => {
  return (
    <Canvas style={{ width: '100vw', height: '100vh' }} gl={{ clearColor: 'black' }}>
      <ambientLight intensity={50.0} />
      <directionalLight position={[10, 100, 5]} intensity={1.5} />
      <Model />
      <LCDScreen />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
