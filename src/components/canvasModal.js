import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { ImageContext } from "../context/imageContext";
import Canvas from "./canvas";
import Toolbar from "./toolbar";
import { abortImageServices } from "../services/imageServices";
import { toast } from "react-toastify";
import ImagePreview from "./ImagePreview";

function CanvasModal({
isDeletingAll,
            isDeletingObject,
            handleObjectClick,
            brushData,
            setBrushData,
            setLocalSrc,
            setOriginalCoord,
            originalCoord,
            imageDimension,
            detectedDimension,
            isBrushed,
            setIsBrushed,
            history,
            handleUndo,
            setHistory,
            isUndoing,
            brushedImage,
            isBrushing,
            setBrushedImage,
            setDrawPath,
}) {
  const [paths, setPaths] = useState([]);
  const [modal, setModal] = useState({ height: 700, width: 700 });
  const [imageData] = useContext(ImageContext)

  const boxRef = useRef();

  const handleResize = () => {
    if (!boxRef?.current) return;
    // let ratio = imageDimension.width / imageDimension.height;

    let obj = {
      height: boxRef.current.clientHeight,
      width: boxRef.current.clientWidth,
    };
    setModal({ ...obj });
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
const handleModalClose = ()=>{
  if(isBrushed){
    setIsBrushed(false)
    if (!imageData.coords?.length) toast.warning("No objects detected");
  }
}

  return (
    <>
      <Modal
        show={brushData?.brushMode}
        fullscreen={true}
        // onHide={() => {
        //   setBrushData({ ...brushData, brushMode: false });
        //   abortImageServices();
        // }}
        backdrop="static"
        keyboard={false}
        animation={false}
        centered
      >
        <Modal.Header closeButton={false}>
          {/* <Modal.Title>Brush Image</Modal.Title> */}
          <div
            className="cursor-pointer modal-title h5"
            onClick={() => {
              setBrushData({ ...brushData, brushMode: false });
              handleModalClose();
              abortImageServices();
            }}
          >
            <i className="bi bi-arrow-left me-1 "></i>
            <span>Back</span>
          </div>
        </Modal.Header>
        <Modal.Body ref={boxRef}>
          <ImagePreview
            isDeletingAll={isDeletingAll}
            isDeletingObject={isDeletingObject}
            handleObjectClick={handleObjectClick}
            brushData={brushData}
            setBrushData={setBrushData}
            setLocalSrc={setLocalSrc}
            setOriginalCoord={setOriginalCoord}
            originalCoord={originalCoord}
            imageDimension={imageDimension}
            detectedDimension={detectedDimension}
            isBrushed={isBrushed}
            setIsBrushed={setIsBrushed}
            history={history}
            handleUndo={handleUndo}
            setHistory={setHistory}
            isUndoing={isUndoing}
            brushedImage={brushedImage}
            isBrushing={isBrushing}
            setBrushedImage={setBrushedImage}
            setDrawPath={setDrawPath}
          ></ImagePreview>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </>
  );
}

export default CanvasModal;
