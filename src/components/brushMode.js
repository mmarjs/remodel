import React, { useContext, useRef } from 'react'
import { Canvas } from 'react-sketch-canvas';
import { ImageContext } from '../context/imageContext';
import Tools from './tools';

function BrushMode({
    brushData,
    setDrawPath,
    brushedImage,
    isBrushing,
    setBrushedImage,
    imageDimension,
  setBrushData,
  isDeletingObject,
  handleObjectClick,
  isDeletingAll,
  isBrushed,
  setIsBrushed,
  handleParent,
  getDimension,
  imageRef,
}) {
  const [imageData] = useContext(ImageContext);

  const imgRef = useRef({});
  imgRef.value = imageRef;

  return (
    <>
      <img
        ref={imgRef}
        src={URL.createObjectURL(imageData?.originalImage)}
        className={
          " object-fit rounded-2  h-max-90vh w-max-90vw " +
          (isDeletingObject && "loading-image")
        }
        id="img-detected-0"
        style={{
          objectFit: "contain",
          maxWidth: "100%",
          height: getDimension()?.height,
          width: getDimension()?.width,
          opacity: 0,
          position: "absolute",
          left: 0,
        }}
        alt="img"
      />
      <Canvas
        brushData={brushData}
        setDrawPath={setDrawPath}
        brushedImage={brushedImage}
        isBrushing={isBrushing}
        setBrushedImage={setBrushedImage}
        imageDimension={imageDimension}
      />
      <Tools
        brushData={brushData}
        setBrushData={setBrushData}
        isDeletingObject={isDeletingObject || isBrushing}
        handleObjectClick={handleObjectClick}
        isDeletingAll={isDeletingAll}
        isBrushed={isBrushed}
        setIsBrushed={setIsBrushed}
        handleParent={ handleParent}
      /> 
    </>
  );
}

export default BrushMode