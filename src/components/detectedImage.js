import React, { useContext, useEffect, useRef, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ImageContext } from "../context/imageContext";
import { Constants } from "../data/constants";
import { mapPath } from "../utils/mapPaths";
import Canvas from "./canvas";
import DrawObjects from "./drawObjects";
import Tools from "./tools";


function DetectedImageBox({
  brushData,
  setBrushData,
  handleObjectClick,
  isDeletingObject,
  setOriginalCoord,
  originalCoord,
  detectedDimension,
  imageDimension,
  isDeletingAll,
  isBrushed,
  setIsBrushed,
  brushedImage,
  isBrushing,
  setBrushedImage,
  setDrawPath,
}) {
    const [canvasData, setCanvasData] = useState({
      height: 0,
      width: 0,
      path: [],
    });
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageData, setImageData] = useContext(ImageContext);
  const [percentageChange, setPercentageChange] = useState([]);
  const zoomRef = useRef()
  const [ref, setRef] = useState({});
  const [zoomDisable, setZoomDisable] = useState(true)
  const coordRef = useRef({}).current;
  coordRef.value = imageData.coords;
  const originalCoordRef = useRef({}).current;
  originalCoordRef.value = originalCoord;

  const imageRef = useRef();
  const boxRef = useRef();

  const imgRef = useRef({});
  imgRef.value = imageRef;

  useEffect(() => {
    setImageData({ ...imageData, ...ref });
  }, [ref]);

  const handleResize = () => {
    if (!imageRef?.current || !boxRef?.current) return;
    // clearInterval(clear);
    // clear = setTimeout(() => {
    let coords = coordRef.value;

    let rx =
      imageRef?.current?.clientWidth /
      (detectedDimension.width -
        (imageData?.padding?.left + imageData?.padding?.right));
    let ry =
      imageRef?.current?.clientHeight /
      (detectedDimension.height -
        (imageData?.padding?.top + imageData?.padding?.bottom));

    let py = (imageData?.padding?.bottom + imageData?.padding?.top) / 2;
    let px = (imageData?.padding?.left + imageData?.padding?.right - rx) / 2;

    let newCoords = coords?.map((v, i) => {
      v.coordinates[0] =
        -(px * rx) +
        imageRef?.current?.offsetLeft +
        originalCoordRef?.value?.[i]?.coordinates?.[0] * rx;
      v.coordinates[1] =
        ry -
        py * ry +
        imageRef?.current?.offsetTop +
        originalCoordRef?.value?.[i]?.coordinates?.[1] * ry;
      v.coordinates[2] =
        -(px * rx) +
        imageRef?.current?.offsetLeft +
        originalCoordRef?.value?.[i]?.coordinates?.[2] * rx;
      v.coordinates[3] =
        ry -
        py * ry +
        imageRef?.current?.offsetTop +
        originalCoordRef?.value?.[i]?.coordinates?.[3] * ry;
      if (v.coordinates[0] < 0) v.coordinates[0] = 0;
      else if (v.coordinates[0] > imageRef.current.clientWidth)
        v.coordinates[0] = imageRef.current.clientWidth;

      if (v.coordinates[1] < 0) v.coordinates[1] = 0;
      else if (v.coordinates[1] > imageRef.current.clientHeight)
        v.coordinates[1] = imageRef.current.clientHeight;

      if (v.coordinates[2] < 0) v.coordinates[2] = 0;
      else if (v.coordinates[2] > imageRef.current.clientWidth)
        v.coordinates[2] = imageRef.current.clientWidth;

      if (v.coordinates[3] < 0) v.coordinates[3] = 0;
      else if (v.coordinates[3] > imageRef.current.clientHeight)
        v.coordinates[3] = imageRef.current.clientHeight;

      return v;
    });
    setTimeout(() => {
      setPercentageChange([rx, ry]);
    }, 0);
    setRef({ coords: newCoords });
    // });
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (originalCoord?.length < 0) return;
      handleResize();
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (originalCoord?.length < 0) return;
      handleResize();
    }, []);
  }, [imageData?.originalImage,imageRef?.current]);

  //  useEffect(() => {
  //    coordRef.value = imageData?.coords
  //  }, [imageData.coords]);

  const getDimension = () => {
    return { height: "", width: "" };
    return imageDimension?.width > 1024
      ? { height: "", width: "" }
      : { width: Constants?.screenDimensions2?.xsm?.width, height: "" };
    //  let height = (window?.innerHeight / 100) * 90;
    //  let height2 = (window?.innerHeight / 100) * 70;
    //  let heightDec =
    //    ((imageDimension.height - height) / imageDimension.height) * 100;
    //  let heightDec2 =
    //    ((imageDimension.height - height2) / imageDimension.height) * 100;
    //  let width = (imageDimension.width / 100) * heightDec;
    //  let width2 = (imageDimension.width / 100) * heightDec2;
    //  width = Math.abs(imageDimension.width - width);
    //  width2 = Math.abs(imageDimension.width - width2);

    //  return {
    //    height: imageDimension.width > 1000 ? height : height2,
    //    width: imageDimension.width > 1000 ? width : width2,
    //  };

    // if (imageDimension?.width > 1000)
    // return { height: "", width: "" }

    // else{
    //   let height2 = (window?.innerHeight / 100) * 70;
    //    let heightDec2 =
    //      ((imageDimension.height - height2) / imageDimension.height) * 100;

    //       let width2 = (imageDimension.width / 100) * heightDec2;
    //   return {height:height2,width:width2}
    // }
  };

  const handleParent = () => {
    setTimeout(() => {
      handleResize();
    });
  };

  const handleZoomEffect = (type, method) => {
    method();
    setZoomDisable(false)
    setTimeout(() => {
      // console.log(zoomRef?.current?.state?.scale)
      setZoomDisable(zoomRef?.current?.state?.scale === 1)
    }, 1000)
  }

     const handleDone = () => {
       if (
         !canvasData?.path?.length ||
         !canvasData?.path?.[0]?.paths?.length
       )
         return;
       removeSelectedPath(canvasData?.path);
     };

      const draw = (ctx, img, paths) => {
        // setCanvasData({
        //   height: canvasDimension[0],
        //   width: canvasDimension[1],
        //   path: paths,
        // });
        let modifiedPaths = mapPath(
          paths,
          { height: ctx.canvas.height, width: ctx.canvas.width },
          { height: canvasData?.height, width: canvasData?.width }
        );
        // let modifiedPaths = paths?.map((p) => {
        //   let temp = { ...p };
        //   temp.strokeWidth = p.strokeWidth*rx;
        //   temp.paths = temp?.paths?.map((q) => {
        //     let tempQ = {};
        //     tempQ.x = Math.round(q?.x * rx);
        //     tempQ.y = Math.round(q?.y * ry);
        //     return tempQ;
        //   });
        //   return temp;
        // });
        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
        for (let item of modifiedPaths) {
          ctx.beginPath();
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = item.strokeWidth;

          ctx.moveTo(item?.paths[0]?.x, item?.paths[0]?.y);
          for (let i = 1; i < item?.paths?.length; i++) {
            ctx.lineTo(item?.paths[i]?.x, item?.paths[i]?.y);
          }
          if (item?.paths?.length === 1) {
            ctx.lineTo(item?.paths[0]?.x + 1, item?.paths[0]?.y + 1);
          }
          // ctx.closePath();
          ctx.strokeStyle = "white";
          ctx.stroke();
        }

       
        ctx.canvas.toBlob(
          (maskImg) => {
            setDrawPath(modifiedPaths);
            setBrushedImage(maskImg);
          },
          "image/jpeg",
          1
        );
        //     var newTab = window.open();
        // newTab.document.body.innerHTML = `<img src="${jpegUrl}`
        // let brushedSrc = jpegUrl.slice(jpegUrl?.indexOf(",") + 1);
       
        // setDrawPath(modifiedPaths);
        // setBrushedImage(brushedSrc);
      };

      const removeSelectedPath = (paths) => {
        let dyanmicCanvas = document.createElement("CANVAS");
        var img = document.createElement("IMG");
        img.onload = function () {
          dyanmicCanvas.height = img.height;
          dyanmicCanvas.width = img.width;
          let ctx = dyanmicCanvas.getContext("2d");
          draw(ctx, img, paths);
        };
        // let blob =imageData?.originalImage;
        // let blob = URL.createObjectURL(imageData.originalImage);
        img.src = URL.createObjectURL(imageData?.originalImage);
      };

 
  return (
    <div className="p-0 m-0 w-100" id="cursor-pan">
      {!brushData.brushMode ? (
        <TransformWrapper
          ref={zoomRef}
          doubleClick={{ disabled: true }}
          centerOnInit={true}
          centerZoomedOut={true}
          wheel={{ disabled: true }}
          panning={{ disabled: zoomDisable }}
          disabled={zoomDisable}
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <>
              <TransformComponent>
                <div
                  ref={boxRef}
                  className="d-flex justify-content-center align-items-center position-relative cursor-pan "
                >
                  <TailSpin
                    height="50"
                    width="50"
                    color="#dc3545"
                    ariaLabel="tail-spin-loading"
                    radius="1"
                    wrapperStyle={{ zIndex: 5 }}
                    wrapperClass="position-absolute justify-content-center align-items-center h-100 w-100"
                    visible={isDeletingObject}
                  />

                  {imageData?.coords?.length ? (
                    imageData?.coords?.map((c) =>
                      c?.key ? (
                        <DrawObjects
                          key={c?.key}
                          c={c}
                          setZoomDisable={setZoomDisable}
                          zoomDisable={zoomDisable}
                          zoomRef={zoomRef}
                          percentageChange={percentageChange}
                          originalCoord={originalCoord}
                          setOriginalCoord={setOriginalCoord}
                          detectedDimension={detectedDimension}
                          handleParent={handleParent}
                          isDeletingObject={isDeletingObject}
                          handleObjectClick={handleObjectClick}
                          resetTransform={resetTransform}
                          showTooltip={showTooltip}
                          setShowTooltip={setShowTooltip}
                        />
                      ) : (
                        // <Test2
                        //   key={c?.key}
                        //   c={c}
                        //   percentageChange={percentageChange}
                        //   originalCoord={originalCoord}
                        //   setOriginalCoord={setOriginalCoord}
                        //   detectedDimension={detectedDimension}
                        //   handleParent={handleParent}
                        //   isDeletingObject={isDeletingObject}
                        //   handleObjectClick={handleObjectClick}
                        //   resetTransform={resetTransform}
                        // />
                        <></>
                      )
                    )
                  ) : (
                    <></>
                  )}

                  <img
                    ref={imageRef}
                    src={URL.createObjectURL(imageData?.originalImage)}
                    className={
                      "img-detected object-fit rounded-2  h-max-80vh w-max-90vw " +
                      (isDeletingObject && "loading-image")
                    }
                    id="img-detected"
                    style={{
                      objectFit: "contain",
                      // maxWidth: "100%",
                      height: getDimension()?.height,
                      width: getDimension()?.width,
                    }}
                    alt="img"
                  />
                </div>
              </TransformComponent>
              <Tools
                zoomIn={() => {
                  handleZoomEffect("zoomIn", zoomIn);
                }}
                zoomOut={() => {
                  handleZoomEffect("zoomIn", zoomOut);
                }}
                resetTransform={() => {
                  handleZoomEffect("zoomIn", resetTransform);
                }}
                brushData={brushData}
                setBrushData={setBrushData}
                isDeletingObject={isDeletingObject || isBrushing}
                handleObjectClick={handleObjectClick}
                isDeletingAll={isDeletingAll}
                isBrushed={isBrushed}
                setIsBrushed={setIsBrushed}
                showTooltip={showTooltip}
                setShowTooltip={setShowTooltip}
                handleParent={() => {
                  handleParent();
                  resetTransform();
                }}
              />
            </>
          )}
        </TransformWrapper>
      ) : (
        <div>
          <img
            ref={imgRef}
            src={URL.createObjectURL(imageData?.originalImage)}
            className={
              " object-fit rounded-2  h-max-80vh w-max-90vw " +
              (isDeletingObject && "loading-image")
            }
            id="img-detected-0"
            style={{
              objectFit: "contain",
              // maxWidth: "100%",
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
            canvasData={canvasData}
            setCanvasData={setCanvasData}
          />
          <Tools
            brushData={brushData}
            setBrushData={setBrushData}
            isDeletingObject={isDeletingObject || isBrushing}
            handleObjectClick={handleObjectClick}
            isDeletingAll={isDeletingAll}
            isBrushing={isBrushing}
            isBrushed={isBrushed}
            setIsBrushed={setIsBrushed}
            handleParent={() => {
              handleParent();
            }}
            canvasData={canvasData}
            handleDone={handleDone}
          />
        </div>
      )}
    </div>
  );
}

export default DetectedImageBox;
