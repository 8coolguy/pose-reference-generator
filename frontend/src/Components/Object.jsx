// src/Object.jsx (Example SelectableNodeWrapper)
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGraph } from '@react-three/fiber'; // Only if SelectableNodeWrapper needs graph info

export function SelectableNodeWrapper({
  name, // The node's name
  geometry,
  material,
  isSelected,
  onClick,
  children, // If you wrap actual primitive objects
  ...props // For other mesh props like position, rotation etc.
}) {
  const meshRef = useRef();

  // Create a memoized highlight material to avoid re-creation on every render
  const highlightMaterial = useMemo(() => {
    if (material && material.isMaterial) {
      const clonedMaterial = material.clone();
      clonedMaterial.emissive = new THREE.Color(0xffff00); // Yellow emissive
      clonedMaterial.emissiveIntensity = 0.5;
      return clonedMaterial;
    }
    return new THREE.MeshStandardMaterial({ color: 0xcccccc, emissive: new THREE.Color(0xffff00), emissiveIntensity: 0.5 }); // Fallback material
  }, [material]);


  // Apply or remove highlight based on isSelected prop
  useEffect(() => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.material = highlightMaterial;
      } else {
        meshRef.current.material = material; // Revert to original
      }
    }
  }, [isSelected, material, highlightMaterial]);

  // If the node is a bone, it won't have geometry/material directly,
  // so you'd render a simple SphereGeometry for it
  const isBone = geometry === undefined && material === undefined && props.isBone;
  const boneGeometry = useMemo(() => new THREE.SphereGeometry(0.05), []);
  const boneMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: isSelected ? 'red' : 'cyan', transparent: true, opacity: isSelected ? 0.8 : 0.4, depthWrite: false }), [isSelected]);


  if (isBone) {
    return (
      <mesh
        ref={meshRef}
        geometry={boneGeometry}
        material={boneMaterial}
        onClick={onClick}
        {...props}
      />
    );
  }

  // Render the actual mesh
  return (
    <mesh
      name={name} // Keep the original name for identification
      ref={meshRef}
      geometry={geometry}
      material={material} // Will be overwritten by effect if selected
      onClick={onClick}
      {...props} // Pass through position, rotation, scale etc.
    >
      {children}
    </mesh>
  );
}