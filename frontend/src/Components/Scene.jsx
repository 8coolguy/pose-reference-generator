import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'; // Import useState, useCallback, useMemo
import { useGLTF, TransformControls  }from '@react-three/drei'; // Import TransformControls
import { useGraph, useThree } from '@react-three/fiber'; // Import useThree
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

// Import your SelectableNodeWrapper
import { SelectableNodeWrapper } from "./Object.jsx"; // Assuming Object.jsx contains it

export function Model(props) {
  const { scene } = useGLTF('/scene.gltf');
  // Clone the scene for independent manipulation.
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  // Use useGraph to get a flat map of all nodes and materials
  const { nodes, materials } = useGraph(clone);


  const modelRef = useRef(); // Ref for the entire model group
  const transformControlsRef = useRef(); // Ref for TransformControls

  const { camera, gl } = useThree(); // Get camera and WebGL renderer context

  // State to track the currently selected node (a THREE.Object3D instance)
  const [selectedNode, setSelectedNode] = useState(null);

  // Callback when a node is clicked
  const handleNodeClick = useCallback((node) => {
    // If the clicked node is already selected, deselect it. Otherwise, select it.
    setSelectedNode(prevSelected => (prevSelected === node ? null : node));
    console.log('Clicked node:', node.name, node.uuid);
  }, []);

  // Effect to attach/detach TransformControls to the selected node
  useEffect(() => {
    if (selectedNode && transformControlsRef.current) {
      transformControlsRef.current.attach(selectedNode);
      console.log('Attached TransformControls to:', selectedNode.name);
    } else if (transformControlsRef.current) {
      transformControlsRef.current.detach();
      console.log('Detached TransformControls.');
    }
    console.log('Current transformControlsRef.current:', transformControlsRef.current);
  }, [selectedNode]);

  // Optional: Handle keyboard input to toggle TransformControls mode (translate/rotate/scale)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!transformControlsRef.current) return;
      switch (event.key.toLowerCase()) {
        case 'w': transformControlsRef.current.mode = 'translate'; break;
        case 'e': transformControlsRef.current.mode = 'rotate'; break;
        case 'r': transformControlsRef.current.mode = 'scale'; break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Optional: Keep camera focused on selected node when dragging
  // This is where you'd put the onDrag logic from previous examples
  const handleDrag = useCallback((l, deltaL, w, deltaW) => {
      // You can add your camera-following logic here if needed
      // For instance, update OrbitControls target to keep looking at `w`

      // 1. Get the world position of the dragged node
    const nodeWorldPosition = new THREE.Vector3();
    nodeWorldPosition.setFromMatrixPosition(w);

    // 2. Get the world rotation of the dragged node (as Euler angles for logging)
    const nodeWorldQuaternion = new THREE.Quaternion();
    nodeWorldQuaternion.setFromRotationMatrix(w);
    const nodeWorldEuler = new THREE.Euler();
    nodeWorldEuler.setFromQuaternion(nodeWorldQuaternion, 'YXZ'); // 'YXZ' for typical object rotations

    // 3. Log the transformation data
    console.group("Node Dragging - Live Transform");
    console.log("Node:", selectedNode ? selectedNode.name : "N/A");
    console.log("World Position (X,Y,Z):",
      nodeWorldPosition.x.toFixed(2),
      nodeWorldPosition.y.toFixed(2),
      nodeWorldPosition.z.toFixed(2)
    );
    console.log("World Rotation (Degrees - Y,X,Z):",
      THREE.MathUtils.radToDeg(nodeWorldEuler.y).toFixed(1), // Yaw
      THREE.MathUtils.radToDeg(nodeWorldEuler.x).toFixed(1), // Pitch
      THREE.MathUtils.radToDeg(nodeWorldEuler.z).toFixed(1)  // Roll
    );
    console.groupEnd();

    // 4. Update OrbitControls target to keep the camera focused on the dragged node
    if (transformControlsRef.current) {
      transformControlsRef.current.target.copy(nodeWorldPosition);
      // If OrbitControls damping is enabled, you MUST call .update()
      if (transformControlsRef.current.enableDamping) {
        transformControlsRef.current.update();
      }
    }
  }, [selectedNode, transformControlsRef]);


  // --- Render the Model's Hierarchy ---
  return (
    <group ref={modelRef} {...props} dispose={null}>
      {/*
        Iterate over the 'nodes' object from useGraph.
        This allows you to render individual meshes and bones.
      */}
      {Object.values(nodes).slice(96,220).map((node) => {
        // Render meshes using SelectableNodeWrapper
        if (node.isMesh) {
          // You might want to filter specific meshes by name or type
          // e.g., if (node.name.includes('Body') || node.name.includes('Arm'))
          return (
            <SelectableNodeWrapper
              key={node.uuid} // Unique key for React list rendering
              name={node.name}
              geometry={node.geometry}
              material={materials[node.material.name] || node.material} // Use material from 'materials' map if available
              // Apply node's world transform directly IF it's not parented by a group.
              // A safer way is to use <primitive object={node} /> if you don't need to wrap.
              // However, since we're using SelectableNodeWrapper, we should
              // make sure the node's original transform is respected.
              // This can be complex with cloned hierarchies.
              // For simplicity, we'll assume basic non-hierarchical nodes or
              // that SelectableNodeWrapper takes care of hierarchy via children.

              // The best way for hierarchical models is to wrap <primitive object={node} />
              // in your SelectableNodeWrapper if you want events/props,
              // but still let Three.js handle the scene graph.
              // This example attempts a flat render, which might break complex hierarchies.

              // A more robust approach would be to recursively render the cloned `scene`
              // and swap out `mesh` elements for `SelectableNodeWrapper` within the recursion.
              // For now, let's rely on `useGraph` for flat access and assume transform is handled.

              // For simple models where each node is a top-level mesh:
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
              // If node has a parent, these may be local transforms.
              // You might need to compute world transforms for direct rendering here.

              isSelected={selectedNode === node}
              onClick={(event) => {
                event.stopPropagation(); // Prevent clicking through to other nodes/model
                handleNodeClick(node);
              }}
            />
          );
        }
        // You can also make bones selectable (as per previous discussion)
        else if (node.isBone) {
          // If you want bones to be selectable, the SelectableNodeWrapper needs to handle it
          // e.g., by rendering a small sphere instead of geometry/material
          return (
            <SelectableNodeWrapper
              key={node.uuid}
              name={node.name}
              isBone={true} // Inform the wrapper it's a bone
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
              isSelected={selectedNode === node}
              onClick={(event) => {
                event.stopPropagation();
                handleNodeClick(node);
              }}
            />
          );
        }
        // For other node types (Groups, etc.), you might just render them as primitives
        // to maintain the hierarchy if you don't need them to be individually selectable
        // or if their children are already handled.
        // If not rendering a wrapper, ensure its children (if any) are handled.
        return null; // Don't render non-mesh/non-bone nodes directly here
      })}

      {/* TransformControls for the selected node */}
      {selectedNode && (
        <TransformControls
          ref={transformControlsRef}
          onDrag={handleDrag} // If you want to react to dragging
          onMount={(e) => { // Attach to the domElement for pointer events
            e.domElement = gl.domElement;
          }}
          // The `object` prop automatically attaches it,
          // or you can use `transformControlsRef.current.attach(selectedNode)` in useEffect
          object={selectedNode}
        />
      )}
    </group>
  );
}

useGLTF.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
useGLTF.preload('/scene.gltf');