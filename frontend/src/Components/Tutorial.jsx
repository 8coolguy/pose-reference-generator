import { createContext, useState, useEffect} from "react";
function TutorialContent({page}){
  const renderContent = () => {
    switch (page) {
      case 1:
        return (
        <>
          <p>Pose Reference Generator is a tool designed for artists to generate references for specific poses. The basic workflow for this tool is you set a pose with the 3d humanoid model by clicking and rotating joints. Describe what you would like to see and wait to see the result.</p>
          <img src="image.png"></img>
        </>)
      case 2: 
        return (
        <>
          <p>1. Adjust the pose by clicking on joints and rotating them. The joints are highlighted by blue spheres, but some of them may be less visible. Press Esc to unselect joint. Press s, r, t to switch between scale, rotate and transform modes.</p>
          <img src="image2.png"></img>
        </>
        )
      case 3:
        return (
        <>
          <p>2. Describle what you would like the pose to be as using the prompt.</p>
          <img src="image3.png"></img>
        </>)
      case 4:
        return (
        <>
          <p>3. Wait for the image to generate. They will show up in the gallery section. It takes time for stable diffusion to compute on the Replicate. There is also a cold start taking place. We also may take down the service soon.</p>
          <img src="image4.png"></img>
        </>)
      default:
        return null;
    }
  };
  return (
    <>
    {renderContent()}
    </>
  )
}
export function Tutorial({visible, setVisible}){
  const length = 4;
  const [page, setPage] = useState(1);
  console.log(page);
  return visible ? 
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
      <h2 className="text-2xl mb-4">Welcome to Pose Reference Generator</h2>
      <TutorialContent page={page}/>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-b-sm disabled:opacity-50" onClick={()=>setPage(page - 1 > 0?page-1:1)} disabled={page==1}>
        {"<"}
      </button>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={()=>setVisible(false)}>
        Close
      </button>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50" onClick={()=>setPage(page + 1 <= length?page+1:length)} disabled={page==length}>
        {">"}
      </button>
    </div>
  </div>
   : null
}