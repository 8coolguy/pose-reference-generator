import React, { useRef, useState, useCallback, useEffect, memo} from 'react'
import { Views } from "./Components/Camera.jsx"
import { Prompt } from "./Components/Prompt.jsx"
import { Gallery } from "./Components/Gallery.jsx"
import { Tutorial } from "./Components/Tutorial.jsx"
import './output.css'
const BACKEND =  "https://pose-reference-generator.onrender.com/";
const MAX_REQUESTS = 3;
const areEqual = (prevProps, nextProps) => {
  return prevProps.cameraRef === nextProps.cameraRef;
};

const MViews = memo(Views, areEqual);
function App() {
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]);
  const [update, setUpdate] = useState(0);
  const intervalRef = useRef();
  const ref = useRef();

  function fetchStatus(){
    if(images.length < 1) return;
    let newImages = [];
    console.log("Fetching status for", images);
    images.forEach(element => {
      if(element.status=="starting"){
        const url = `${BACKEND}/status/${element.prediction_id}`;
        fetch(url)
          .then((res)=>res.json())
          .then((res)=> {
            if(res.status=="succeeded"){
              element.status="succeeded";
              element.end = new Date();
              element.outputs= res.outputs;
            }
            else if(res.status=="failed"){
              element.status= "failed";
            }
            newImages.push(element);
          })
          .catch(err=>console.error("Error",err))
      }else{
        newImages.push(element);
      }
    });
    setImages(newImages);
    setUpdate(prev => prev + 1);
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images]);

  function submit(){
    const link = document.createElement('a')
    const canvas = document.querySelector('canvas');
    const button = document.querySelector('button');
    button.disabled = true;
    const image = canvas.toDataURL('image/png');
    const formData = new FormData();
    formData.append('prompt', input);
    canvas.toBlob((blob) => {
      formData.append('image', blob, 'image.png');
      const url = `${BACKEND}/generate`;
      fetch(url, {method: 'POST',body: formData})
        .then((response) => response.json())
        .then((data) => {
          if(images.length < MAX_REQUESTS) {
            setImages(prevItems => [...prevItems, {prediction_id:data.prediction_id, status:"starting", start:new Date(), prompt:input}]);
            button.disabled = false;
          }else{
            alert("Only allowing a maximum of 5 generations");
          }
        })
        .catch((error) => console.error('Upload failed:', error));
    }, 'image/png');
  }
  const [visible, setVisible] = useState(true);
  return (
    <div className="w-full h-full">
      <Tutorial visible={visible} setVisible={setVisible}/>
      <h1>Pose Reference Generator</h1>
      <div className="flex h-10/12 w-full flex-row">
        <div className="min-h-full w-10/12">
          <MViews cameraRef={ref}/> 
        </div>
        <div className="h-full">
          <Gallery className="bg-opacity-90 backdrop-blur-sm z-50 p-4 overflow-y-auto shadow-lg" images={images} update={update}/>
        </div>
      </div>
      <Prompt setVisible={setVisible} input={input} setInput={setInput} submit={submit}/>
    </div>
  )
}
export default App
