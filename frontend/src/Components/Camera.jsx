import React, { useRef, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { FirstPersonControls, Bounds, ContactShadows, useGLTF, OrbitControls, PerspectiveCamera, View, OrthographicCamera, PivotControls, Grid } from '@react-three/drei';
import * as THREE from "three";
import { Model } from "./Scene.jsx"


function Scene({final, initialPosition, setCamera}){
  const cameraOffset = new THREE.Vector3(initialPosition[0], initialPosition[1], initialPosition[2]);
  const modelRef = useRef();
  const ref = useRef();
  const cameraRef = useRef();
  const [selected,setSelected] = useState(null);
  function handleSelect(reference, event){
    event.stopPropagation();
    setSelected(reference);
  }
  const handleDrag = useCallback((l, deltaL, w, deltaW) =>{
      const objectWorldPosition = new THREE.Vector3();
      objectWorldPosition.setFromMatrixPosition(w);
      const camera = new THREE.Vector3();
      camera.copy(objectWorldPosition).add(cameraOffset);
      const objectWorldQuaternion = new THREE.Quaternion();
      objectWorldQuaternion.setFromRotationMatrix(w);
      const objectWorldEuler = new THREE.Euler();
      objectWorldEuler.setFromQuaternion(objectWorldQuaternion);
      setCamera([camera.x, camera.y, camera.z, 
      THREE.MathUtils.radToDeg(objectWorldEuler.x),
      THREE.MathUtils.radToDeg(objectWorldEuler.y),
      THREE.MathUtils.radToDeg(objectWorldEuler.z)
      ]);
    }
  )
  
    return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Model/>
      {final && 
      (
        <>
        <Grid
          args={[10, 10]} // Width and height of the grid (number of cells)
          cellSize={0.6} // Size of each cell
          sectionSize={3} // Size of a major section (thicker lines)
          sectionColor="#444444" // Color of major lines (darker gray)
          sectionThickness={1} // Thickness of major lines
          cellColor="#666666" // Color of minor lines (slightly lighter gray)
          cellThickness={0.5} // Thickness of minor lines
          fadeDistance={25} // Distance at which the grid starts to fade
          followCamera={false} // Grid stays static, doesn't follow camera
          infiniteGrid={true} // Makes the grid appear infinite
        />
          <PivotControls ref={ref} scale={1} mode="translate" enabled={selected == cameraRef} offset={initialPosition} onDrag={handleDrag}>
            <mesh ref={cameraRef} position={initialPosition} onClick={(event)=> handleSelect(cameraRef, event)}> 
              <sphereGeometry args={[.3, 32, 32]} />
              <meshStandardMaterial color={selected == cameraRef ? 'hotpink' : 'orange'} />
            </mesh>
          </PivotControls>
        </>
      )}

    </>
  );
}

function CameraView({children,cameraState}){
  return (
    <>
      <color attach="background" args={['#000000']} />
      <PerspectiveCamera makeDefault position={cameraState.slice(0,3)} rotation={cameraState.slice(3,6)}/>
      <Bounds fit margin={1.5}>
        {children}
      </Bounds>
      <ContactShadows frames={1} position={[0, -1, 0]} blur={1} opacity={0.6} />
    </>
  )
}

function ControllableView({children}){
  return (
    <>
        <color attach="background" args={['#2c2929']} />
        <PerspectiveCamera makeDefault fov={65} />
        <OrbitControls makeDefault />
        <Bounds fit margin={1.5}>
          {children}
        </Bounds>
        <ContactShadows frames={1} position={[0, -1, 0]} blur={1} opacity={0.6} />
    </>
  )
}

export function Views() {
  const ref = useRef();
  const staticRef = useRef();
  const dynamicRef = useRef();
  const initialPosition = [0,5,0];
  const [cameraState, setCamera] = useState([0, 5, 0, 0, 0, 0]);
  return (
    <div ref={ref} className="container">
      <div ref={dynamicRef}>
        <View track={dynamicRef} className="absolute w-full h-full">
          <ControllableView cameraState={cameraState}>
            <Scene final={true} initialPosition={initialPosition} setCamera={setCamera}/>
          </ControllableView>
        </View>
      </div>
      <div ref={staticRef}>
        <View track={staticRef} className="absolute top-[0px] right-[0px] w-[360px] h-[270px] bg-black border-2 border-solid border-white">
          <CameraView cameraState={cameraState}>
            <Scene initialPosition={initialPosition}/>
          </CameraView>
        </View>
      </div>
      <Canvas eventSource={ref} className="canvas">
        <View.Port />
      </Canvas>
    </div>
  )
}