import React, { useRef, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { View, OrthographicCamera, OrbitControls, Bounds, Grid, ContactShadows } from '@react-three/drei'
import * as THREE from "three";
import { Model } from "./Scene.jsx"


function Scene(){
    return (
    <>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Model/>
        <Grid args={[10, 10]} cellSize={0.6} // Size of each cell
            sectionSize={3} // Size of a major section (thicker lines)
            sectionColor="#444444" // Color of major lines (darker gray)
            sectionThickness={1} // Thickness of major lines
            cellColor="#666666" // Color of minor lines (slightly lighter gray)
            cellThickness={0.5} // Thickness of minor lines
            fadeDistance={25} // Distance at which the grid starts to fade
            followCamera={false} // Grid stays static, doesn't follow camera
            infiniteGrid={true} // Makes the grid appear infinite
        />

    </>
  );
}

function ControllableView({children}){
  return (
    <>
        <color attach="background" args={['#2c2929']} />
        <OrthographicCamera makeDefault fov={55} />
        <OrbitControls makeDefault />
        <Bounds fit clip observe margin={1.5}>
          {children}
        </Bounds>
        <ContactShadows frames={1} position={[0, -1, 0]} blur={1} opacity={0.6} />
    </>
  )
}

export function Views({setImage}) {
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
            <Scene final={true} initialPosition={initialPosition}/>
          </ControllableView>
        </View>
      </div>
      <Canvas gl={{ preserveDrawingBuffer: true }} eventSource={ref} className="canvas">
        <View.Port />
      </Canvas>
    </div>
  )
}