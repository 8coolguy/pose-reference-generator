import React, {useMemo} from 'react';


export function Gallery({images,update}){
    const succeededImages = images.filter(image => image.status === 'succeeded');
    const failedImages = images.filter(image => image.status === 'failed');
    const waitImages = images.filter(image => image.status === 'starting');
    return (
        <div className="flex flex-col gap-4">
            <h1>Gallery</h1>
        {succeededImages.map(element=>(
            <div className="flex flex-row" key={element.prediction_id}>
                <img src={element.outputs[0]} alt={element.prompt} style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
                <img src={element.outputs[1]} alt={element.prompt} style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
            </div>
        ))}
        {waitImages.map(element=>(
            <div className="flex flex-col overflow-clip" key={element.prediction_id}>
                <p>Waiting {Math.floor((new Date() - element.start) / (1000 * 60))} minutes.</p>
                <p>{element.prompt}</p>
            </div>
        ))}
        {failedImages.map(element=>(
            <div className="flex flex-row" key={element.prediction_id}>
                <p>Failed {Math.floor((new Date() - element.start) / (1000 * 60))} minutes.</p>
                <p>{element.prompt}</p>
            </div>
        ))}
        </div>

    )
}