import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useGraph, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, TransformControls, OrbitControls, OrthographicCamera } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

// Define camera parameters for orthographic camera
const frustumSize = 200; // Adjust this value to control the "zoom" level
const CAMERA_INITIAL_OFFSET = new THREE.Vector3(0, 5, 10); // Initial offset from the bone/model center

export function Model({ orthoCameraRef, ...props }) {
  // console.log("Model RENDER", orthoCameraRef.current); // Keep for debugging if needed

  const group = useRef();
  const { scene, animations } = useGLTF('/scene.gltf');
  // Clone the scene once to avoid issues with multiple instances or mutations
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone); // Use useGraph on the cloned scene
  const { actions } = useAnimations(animations, group);

  const [selectedBone, setSelectedBone] = useState(null);
  const [mode, setMode] = useState('rotate');
  const [play, setPlay] = useState(false);
  const { gl, camera: defaultCamera, size } = useThree(); // `camera` here is the default R3F camera, not our orthoCamera

  // Ref for OrbitControls instance to access its properties directly
  const orbitControlsRef = useRef();

  // Map bone names to bone objects
  const boneMap = useMemo(() => {
    const map = new Map();
    clone.traverse((object) => {
      if (object instanceof THREE.Bone) {
        map.set(object.name, object);

        // Create bone helper sphere
        const geometry = new THREE.SphereGeometry(4, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 'blue', transparent: true, opacity: 0.4 });
        const sphereMesh = new THREE.Mesh(geometry, material);

        sphereMesh.position.set(0, 0, 0);
        sphereMesh.name = `boneHelper_${object.name}`;
        sphereMesh.userData.boneName = object.name; // Store bone name for raycasting

        object.add(sphereMesh); // Add helper sphere as a child of the bone
      }
    });
    return map;
  }, [clone]); // Re-create boneMap only if clone changes

  const handlePointerDown = (event) => {
    // Only process if the clicked object has a boneName in its userData
    const boneName = event.object.userData.boneName;
    if (boneName) {
      event.stopPropagation(); // Prevent event from bubbling to other objects/controls
      const bone = boneMap.get(boneName);
      setSelectedBone(bone === selectedBone ? null : bone); // Toggle selection
    }
  };

  // Effect to play/pause animation
  useEffect(() => {
    if (play && animations.length > 0) {
      actions[animations[0].name]?.play();
    } else if (!play && animations.length > 0) {
      actions[animations[0].name]?.stop(); // Stop animation if play is false
    }
  }, [play, actions, animations]);

  // Effect for keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedBone(null);
      } else if (event.key === 'r') {
        setMode('rotate');
      } else if (event.key === 't') {
        setMode('translate');
      } else if (event.key === 's') { // Changed 'w' to 's' for scale, as 'w' is common for move
        setMode('scale');
      } else if (event.key === ']') {
        setPlay(prevPlay => !prevPlay); // Toggle play state
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Effect to update bone helper colors
  useEffect(() => {
    boneMap.forEach(bone => {
      const helper = bone.getObjectByName(`boneHelper_${bone.name}`);
      if (helper && helper.material) {
        helper.material.color.set('blue');
        helper.material.opacity = 0.4;
      }
    });

    if (selectedBone) {
      const helper = selectedBone.getObjectByName(`boneHelper_${selectedBone.name}`);
      if (helper && helper.material) {
        helper.material.color.set('red');
        helper.material.opacity = 0.8;
      }
    }
  }, [selectedBone, boneMap]);

  useEffect(() => {
    if (orthoCameraRef.current && orbitControlsRef.current) {
      const bbox = new THREE.Box3().setFromObject(clone);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      orthoCameraRef.current.position.copy(center).add(CAMERA_INITIAL_OFFSET);
      orbitControlsRef.current.target.copy(center);
      orthoCameraRef.current.zoom = 30  ;
      orthoCameraRef.current.updateProjectionMatrix();
      orbitControlsRef.current.update();
    }
  }, [clone, orthoCameraRef, orbitControlsRef]);

  useFrame(() => {
    const camera = orthoCameraRef.current;
    const controls = orbitControlsRef.current;

    if (!camera || !controls) return;

    let cameraTarget = new THREE.Vector3();
    if (selectedBone) {
      selectedBone.getWorldPosition(cameraTarget); // If bone is selected, target it
    } else {
      const bbox = new THREE.Box3().setFromObject(clone);
      bbox.getCenter(cameraTarget); // Otherwise, target the center of the model
    }

    controls.target.lerp(cameraTarget, 0.05); // Adjust lerp factor for smoother movement
    const aspect = size.width / size.height;
    const currentFrustumHeight = frustumSize / camera.zoom;
    camera.left = -currentFrustumHeight * aspect / 2;
    camera.right = currentFrustumHeight * aspect / 2;
    camera.top = currentFrustumHeight / 2;
    camera.bottom = -currentFrustumHeight / 2;

    camera.updateProjectionMatrix();
    controls.update();
  });


  return (
    <group ref={group} {...props} dispose={null} onPointerDown={handlePointerDown}>
      <OrthographicCamera
        ref={orthoCameraRef}
        makeDefault
        near={0.1}
        far={1000}
      />

      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]} scale={2.065}>
          <group name="pexels-media-4260697-1677171430630_001_001_Adult_Male(includeTPose)fbx" rotation={[Math.PI / 2, 0, 0]} scale={1.0}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Object_4">
                  <primitive object={clone} />
                  <skinnedMesh name="Object_6" geometry={nodes.Object_6.geometry} material={materials.body1} skeleton={nodes.Object_6.skeleton} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {selectedBone && (
        <TransformControls object={selectedBone} mode={mode} />
      )}
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault={false}
        enabled={!selectedBone}
        enableZoom={true}
        zoomSpeed={1.0}
        enablePan={true}
        panSpeed={1.0}
        enableRotate={true}
        rotateSpeed={1.0}
        dampingFactor={0.25}
        screenSpacePanning={true}
      />
    </group>
  );
}

useGLTF.preload('/scene.gltf');
