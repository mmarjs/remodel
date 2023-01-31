import React, { useContext, useEffect, useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import CustomCursor from "custom-cursor-react";
import "custom-cursor-react/dist/index.css";
import { ImageContext } from "../context/imageContext";
import { TailSpin } from "react-loader-spinner";
import { mapPath } from "../utils/mapPaths";

function Canvas({
  brushData,
  brushedImage,
  isBrushing,
  imageDimension,
  canvasData,
  setCanvasData,
}) {
  const [imageData] = useContext(ImageContext);

  const canvas = useRef();
  const boxRef = useRef();
  const [canvasDimension, setCanvasDimension] = useState([
    imageDimension.height,
    imageDimension.width,
  ]);

  const [imageSrc, setImageSrc] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const orgImgRef = useRef({}).current;
  orgImgRef.value = imageData?.originalImage;


  useEffect(() => {
    if (!brushedImage) {
      canvas.current?.clearCanvas();
      setCanvasData({ height: 0, width: 0, path: [] });
      // setPaths([]);
    }
  }, [brushedImage]);

  useEffect(() => {
    if (!canvas?.current) return;

    canvas.current.height = imageDimension?.height;
    canvas.current.width = imageDimension?.width;
  }, [imageDimension]);

  const handlePath = async () => {
    if (isBrushing) return;
    if (canvas?.current) {
      let path = await canvas?.current?.exportPaths();
      setCanvasData({
        height: canvasDimension[0],
        width: canvasDimension[1],
        path: path,
      });

      // if (path?.[0]?.paths) {
      //   // handleDone(path);
      // }
      
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", () => {
      setShowCursor(true);
    });
    if (imageDimension?.height > 0) getDimention();
    window.addEventListener("resize", getDimention);

    return () => window.removeEventListener("resize", getDimention);
  }, []);

  const getDimention = () => {
    setTimeout(()=>{
      let elem = document.getElementById("img-detected-0");
      
      setImageSrc("");
      setShowCursor(false);
      // let height = (window?.innerHeight / 100) * 90;
      // let height2 = (window?.innerHeight / 100) * 70;
      setCanvasDimension([elem.clientHeight, elem.clientWidth]);
      // setCanvasDimension([
      //    height ,
      //   width
      // ]);
      setTimeout(async () => {
        // setShowCursor(true);
        setImageSrc(URL.createObjectURL(orgImgRef.value));
      });
    },10)
    // let heightDec =
    //   ((imageDimension.height - height) / imageDimension.height) * 100;
    // let heightDec2 =
    //   ((imageDimension.height - height2) / imageDimension.height) * 100;
    // let width = (imageDimension.width / 100) * heightDec;
    // let width2 = (imageDimension.width / 100) * heightDec2;
    // width = Math.abs(imageDimension.width - width)
    // width2 = Math.abs(imageDimension.width - width2)

    // setCanvasDimension([
    //   imageDimension.width > 1000 ? height : height2,
    //   imageDimension.width > 1000 ? width : width2,
    // ]);

    // console.log(heightDec,height,width)
    // console.log(height/width,imageDimension.height/imageDimension.width)
    // console.log(height)
    // canvas.current.backgroundImage = imageData.base64Start + imageData?.originalImage
    // return imageDimension?.width > 1000
    //   ? window?.innerWidth >= Constants?.screenDimensions?.xl?.screenWidth
    //     ? Constants?.screenDimensions?.xl
    //     : window?.innerWidth >= Constants?.screenDimensions?.lg?.screenWidth
    //       ? Constants?.screenDimensions?.lg
    //       : window?.innerWidth >= Constants?.screenDimensions?.md?.screenWidth
    //         ? Constants?.screenDimensions?.md
    //         : Constants?.screenDimensions?.sm
    //   : imageDimension;
  };

  useEffect(() => {
    setTimeout(async () => {
      // setShowCursor(true);
      setImageSrc(URL.createObjectURL(imageData?.originalImage));
    });
  }, [imageData?.originalImage]);

  useEffect(() => {
    if (!canvasData?.path?.length) return;
    reDrawPaths();
  }, [canvasDimension]);

  const reDrawPaths = () => {
    canvas.current.resetCanvas();
    let modifiedPaths = mapPath(
      canvasData?.path,
      { height: canvasDimension[0], width: canvasDimension[1] },
      canvasData
    );
    canvas.current.loadPaths(modifiedPaths);
  };


  return (
    <div
      onMouseLeave={handlePath}
      onMouseUp={handlePath}
      onTouchEnd={handlePath}
      className={
        " h-100 d-flex justify-content-center align-items-center w-100 overflow-auto" +
        (isBrushing ? "" : " canvas-parent")
      }
    >
      <TailSpin
        height="50"
        width="50"
        color="#dc3545"
        ariaLabel="tail-spin-loading"
        radius="1"
        wrapperStyle={{ zIndex: 10001 }}
        wrapperClass="position-absolute justify-content-center align-items-center h-100 w-100"
        visible={isBrushing}
      />
      <div
        ref={boxRef}
        className="row mx-0 align-items-center justify-content-center position-relative h-100 hover-effect"
      >
        <ReactSketchCanvas
          height={canvasDimension[0]}
          width={canvasDimension[1]}
          className={
            "canvas-con cursor-area p-0 " + (isBrushing ? "loading-image" : "")
          }
          ref={canvas}
          style={{
            // height:  "100%",
            // width: "100%",
            // position: "absolute",
            // backgroundImage:`url(${imageData.base64Start +imageData?.originalImage})`,
            // objectFit: "cover",
            // margin: "0 auto",
            cursor: "none",
          }}
          svgStyle={{
            // height:  "100%",
            // width: "100%",
            // position: "absolute",
            // backgroundImage:`url(${imageData.base64Start +imageData?.originalImage})`,
            objectFit: "fill",
            // margin: "0 auto",
            cursor: "none",
          }}
          strokeWidth={brushData.brushStock}
          eraserWidth={brushData.brushStock}
          strokeColor="#dc3545b3"
          // preserveBackgroundImageAspectRatio="xMidYMid meet"
          backgroundImage={imageSrc}
        />
        {/* <CustomCursor
          targets={[".cursor-area"]}
          customClass="custom-cursor"
          dimensions={brushData.brushStock * 2}
          strokeColor="#dc3545"
          fill="#dc3545"
          smoothness={{
            movement: 0.5,
            scale: 1,
            opacity: 0.7,
          }}
          opacity={0}
          targetScale={1}
          targetOpacity={0.7}
        /> */}
      </div>
      {imageSrc && showCursor ? (
        <CustomCursor
          targets={[".cursor-area"]}
          customClass="custom-cursor"
          dimensions={brushData.brushStock * 2}
          fill="#dc3545"
          strokeColor="#dc3545"
          smoothness={{
            movement: 0.7,
            scale: 1,
            opacity: 0.7,
          }}
          opacity={0}
          targetScale={isBrushing ? 0 : 1}
          // targetOpacity={0.7}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Canvas;
