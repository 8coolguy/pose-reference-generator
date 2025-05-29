import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Views } from "./Components/Camera.jsx"
import { Prompt } from "./Components/Prompt.jsx"
import { Gallery } from "./Components/Gallery.jsx"
import './output.css'
const BACKEND =  "https://pose-reference-generator.onrender.com/";
const MAX_REQUESTS = 5;
function App() {
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]);
  const intervalRef = useRef();

  function fetchStatus(){
    if(images.length < 1) return;
    let newImages = [];
    console.log(images);
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
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log("Interval", images);
      fetchStatus();
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images]);

  function submit(){
    const link = document.createElement('a')
    const canvas = document.querySelector('canvas');
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
          }else{
            alert("Only allowing a maximum of 5 generations");
          }
        })
        .catch((error) => console.error('Upload failed:', error));
    }, 'image/png');
  }
  return (
    <div className="w-full h-full">
      <h1>Pose Referecne Generator</h1>
      <div className="flex h-10/12 flex-row">
        <div className="min-h-full w-full">
          <Views/> 
        </div>
        <div className="h-full">
          <Gallery className="bg-opacity-90 backdrop-blur-sm z-50 p-4 overflow-y-auto shadow-lg" images={images} />
        </div>
      </div>
      <Prompt input={input} setInput={setInput} submit={submit}/>
    </div>
  )
}
export default App
