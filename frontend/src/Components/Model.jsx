import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useGraph, useThree, useFrame } from '@react-three/fiber'; // Import useFrame
import { useGLTF, useAnimations, TransformControls, OrbitControls, OrthographicCamera } from '@react-three/drei'; // Import OrthographicCamera
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

// Define camera parameters for orthographic camera
const frustumSize = 10; // Adjust this value to control the "zoom" level
const CAMERA_OFFSET = new THREE.Vector3(0, 20, 50); // Offset from the bone

export function Model(props) {
  const group = useRef();
  const { scene, animations } = useGLTF('/scene.gltf');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);

  const [selectedBone, setSelectedBone] = useState(null);
  const [play, setPlay] = useState(false);
  const { gl, camera: defaultCamera, size } = useThree(); // Get gl, default camera, and size

  // Create an orthographic camera ref
  const orthoCameraRef = useRef();

  // Map bone names to bone objects
  const boneMap = useMemo(() => {
    const map = new Map();
    clone.traverse((object) => {
      if (object instanceof THREE.Bone) {
        map.set(object.name, object);

        const geometry = new THREE.SphereGeometry(4, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 'blue', transparent: true, opacity: 0.4 });
        const sphereMesh = new THREE.Mesh(geometry, material);

        sphereMesh.position.set(0, 0, 0); 
        sphereMesh.name = `boneHelper_${object.name}`;
        sphereMesh.userData.boneName = object.name;

        object.add(sphereMesh);
      }
    });
    return map;
  }, [clone]);

  const handlePointerDown = (event) => {
    const boneName = event.object.userData.boneName;
    if (boneName) {
      event.stopPropagation();
      const bone = boneMap.get(boneName);
      setSelectedBone(bone === selectedBone ? null : bone);
    }
  };

  // Effect to play an animation
  useEffect(() => {
    if (play && animations.length > 0) {
      actions[animations[0].name]?.play();
    }
  }, [actions, animations]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedBone(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Effect to update the helper sphere color when selectedBone changes
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

  // Use useFrame to update the camera position and target
  useFrame(({ camera, controls }) => {
    if (selectedBone && orthoCameraRef.current) {
      const boneWorldPosition = new THREE.Vector3();
      selectedBone.getWorldPosition(boneWorldPosition); // Get the bone's world position

      // Calculate camera position with offset
      const cameraTargetPosition = boneWorldPosition.clone().add(CAMERA_OFFSET);

      // Smoothly interpolate the camera's position (optional, but good for UX)
      camera.position.lerp(cameraTargetPosition, 0.1); // Adjust 0.1 for smoothness
      
      // Make the camera look at the bone's world position
      camera.lookAt(boneWorldPosition);

      // Update frustum for orthographic camera (important for responsive sizing)
      const aspect = size.width / size.height;
      orthoCameraRef.current.left = -frustumSize * aspect / 2;
      orthoCameraRef.current.right = frustumSize * aspect / 2;
      orthoCameraRef.current.top = frustumSize / 2;
      orthoCameraRef.current.bottom = -frustumSize / 2;
      orthoCameraRef.current.updateProjectionMatrix();

      // If OrbitControls are active, update their target to the bone's world position
      if (controls && controls.target) {
        controls.target.lerp(boneWorldPosition, 0.1); // Smoothly update OrbitControls target
      }
    }
  });


  return (
    <group ref={group} {...props} dispose={null} onPointerDown={handlePointerDown}>
      <OrthographicCamera
        ref={orthoCameraRef}
        makeDefault
        zoom={10}
        near={0.1}
        far={1000}
        position={CAMERA_OFFSET}
      />

      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]} scale={1.065}>
          <group name="pexels-media-4260697-1677171430630_001_001_Adult_Male(includeTPose)fbx" rotation={[Math.PI / 2, 0, 0]} scale={3.5}>
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
        <TransformControls object={selectedBone} mode="rotate" />
      )}
      <OrbitControls makeDefault={false} enabled={!selectedBone} /> 
    </group>
  );
}

useGLTF.preload('/scene.gltf');