import React, { useState, useEffect, useContext } from "react";
import UploadImage from "../components/uploadImage";
import ImagePreview from "../components/ImagePreview";
import {
  getImage,
  removeFromBrush,
  removeObject,
} from "../services/imageServices";
import { toast } from "react-toastify";
import { ImageContext } from "../context/imageContext";
import CanvasModal from "../components/canvasModal";
import HomeShimmer from "../components/shimmer/homeShimmer";
import { Constants } from "../data/constants";
import { getBrushSize } from "../utils/getBrushSize";
export default function Home() {
  const [imageData, setImageData] = useContext(ImageContext);
  const [history, setHistory] = useState([]);
  const [isUndoing, setIsUndoing] = useState(false);
  const [originalCoord, setOriginalCoord] = useState([]);
  const [isGettingImage, setIsGettingImage] = useState(false);
  const [isDeletingObject, setIsDeletingObject] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isBrushing, setIsBrushing] = useState(false);
  const [isBrushed, setIsBrushed] = useState(false);
  const [brushedImage, setBrushedImage] = useState("");
  const [drawPath, setDrawPath] = useState([]);
  const [brushData, setBrushData] = useState({
    brushStock: getBrushSize(),
    brushMode: false,
  });
  const [imageDimension, setImageDimension] = useState({
    height: 700,
    width: 700,
  });
  const [detectedDimension, setDetectedDimension] = useState({
    height: 0,
    width: 0,
  });

  const [localSrc, setLocalSrc] = useState(imageData.originalImage);
  // const uniqueSessionid = localStorage.getItem('Session_Id')

  useEffect(() => {
    // sessionStorage.setItem('key',(new Date()).getTime())
    if (imageData.originalImage) {
      let img = new Image();
      img.onload = function () {
        setImageDimension({ height: img?.height, width: img?.width });
      };
      // if(!imageData.image)
      //  blob = URL.createObjectURL( imageData.originalImage);

      img.src =URL.createObjectURL(imageData.originalImage);
    }
  }, [imageData?.originalImage]);

  useEffect(() => {
    handleBrushUpdate();
  }, [brushedImage]);

  useEffect(() => {
    getImageData();
  }, [imageData.getImage]);

  const handleObjectClick = async (object, isRemoveAll = false) => {
    try {
      if (isDeletingObject) return;
      setIsDeletingObject(true);
      setIsDeletingAll(isRemoveAll);
      drawMask(object, isRemoveAll);
      return;
      setIsDeletingObject(true);
      let form = new FormData();
      form.append("original_image", imageData?.originalImage);
      // form.append("folder_name", imageData?.Folder_name_for_masks);
      // form.append("object_removal_name", isRemoveAll ? "" : object.key);
      // form.append("Session_Id", uniqueSessionid);

      form.append("remove_all", isRemoveAll ? 1 : 0);

      const { data } = await removeObject(form);
      setImageDataState2(data, true);
      if (isRemoveAll && !data?.[0]?.Coordinates) {
        toast.success("All objects removed successfully");
      }
      if (
        data?.[0]?.Coordinates !== "[]" &&
        data?.[0]?.Coordinates.startsWith("[")
      ) {
        let slicedkey = object?.key?.slice(
          0,
          object?.key?.indexOf("0") > -1
            ? object?.key?.indexOf("0")
            : object?.key?.length
        );
        toast.success(slicedkey + " deleted successfully");
      }
      setIsDeletingObject(false);
      setIsDeletingAll(false);
    } catch (ex) {
      setIsDeletingObject(false);
      setIsDeletingAll(false);

      if (
        ex?.code !== Constants.ERRORS.CANCELED_ERROR.code &&
        ex?.response?.status >= 400 &&
        ex?.response?.status < 500
      )
        toast.error(ex);
    }
  };

  const handleDelete = async (maskImg, object, isRemoveAll = false) => {
    try { 
      let form = new FormData();
      // form.append("folder_name", imageData?.Folder_name_for_masks);

      // form.append("object_removal_name", isRemoveAll ? object.key : "");

      // form.append("Session_Id", uniqueSessionid);

      form.append("remove_all", isRemoveAll ? 1 : 0);
      form.append("mask_image", maskImg);

      form.append("original_image", imageData?.originalImage);

      const response = await removeObject(form);
      setImageDataState2(response, true,true,isRemoveAll);
      if (isRemoveAll && !response?.headers?.get("coordinates")) {
        toast.success("All objects removed successfully");
      }
      if (
        response?.headers?.get("coordinates") !== "[]" &&
        response?.headers?.get("coordinates").startsWith("[")
      ) {
        let slicedkey = object?.key?.slice(
          0,
          object?.key?.indexOf("0") > -1
            ? object?.key?.indexOf("0")
            : object?.key?.length
        );
        toast.success(slicedkey + " deleted successfully");
      }
      setIsDeletingObject(false);
      setIsDeletingAll(false);
    } catch (ex) {
      setIsDeletingObject(false);
      setIsDeletingAll(false);

      if (
        ex?.code !== Constants.ERRORS.CANCELED_ERROR.code &&
        ex?.response?.status >= 400 &&
        ex?.response?.status < 500
      )
        toast.error(ex);
    }
  };

  const handleBrushUpdate = async () => {
    try {
      if (!brushedImage ) return;
      setIsBrushing(true);
      let form = new FormData();

      form.append("original_image", imageData?.originalImage);
      form.append("image_mask", brushedImage);
      // form.append("list_of_coordinates_for_overlapping",JSON.stringify(imageData?.objectsWithOriginal));
      // form.append('Session_Id', uniqueSessionid)
      form.append(
        "check_user_used_remove_all_or_not",
        imageData?.isRemoveAllUsed
      );

      const response = await removeFromBrush(form);
      if (imageData?.coords?.length) setIsBrushed(true);
      setImageDataState2(response, false,true,false);
      setBrushedImage("");
      setIsBrushing(false);
    } catch (ex) {
      setIsBrushing(false);
      setBrushedImage("");

      if (
        ex?.code !== Constants.ERRORS.CANCELED_ERROR.code &&
        ex?.response?.status >= 400 &&
        ex?.response?.status < 500
      )
        toast.error(ex);
    }
  };

  const getImageData = async () => {
    try {
      if (!imageData.originalImage) return;
      let form = new FormData();
      form.append("original_image", imageData?.originalImage);
      setIsGettingImage(true);
      // window.scroll({
      //   top: 0,
      //   behavior: "smooth",
      // });
      // form.append('Session_Id', uniqueSessionid)
      let response  = await getImage(form);
     
        setImageDataState2(response, true, false,false);

      setTimeout(() => {
        setIsGettingImage(false);
      }, [100]);
    } catch (ex) {
      if (isGettingImage) {
        setImageData({
          ...imageData,
          originalImage: "",
        });
      }
      setIsGettingImage(false);
      // setImageData({...imageData,originalImage:''})
      if (
        ex?.code !== Constants.ERRORS.CANCELED_ERROR.code &&
        ex?.response?.status >= 400 &&
        ex?.response?.status < 500
      )
        toast.error(ex);
    }
  };

  const handleUndo = async () => {
    // if(history?.length<2 || isUndoing) return;
    // setIsUndoing(true)
    // setImageDataState2(history[history.length-1],true)
    // setTimeout(()=>{
    //   setHistory(history.slice(0,history.length-2))
    //     setIsUndoing(false);
    // })
  };

  const draw = (ctx, img, object, isRemoveAll) => {
    let rx =
      ctx.canvas.width /
      (detectedDimension.width -
        (imageData?.padding?.left + imageData?.padding?.right));
    let ry =
      ctx.canvas.height /
      (detectedDimension.height -
        (imageData?.padding?.top + imageData?.padding?.bottom));

    let py = (imageData?.padding?.bottom + imageData?.padding?.top) / 2;
    let px = (imageData?.padding?.left + imageData?.padding?.right - rx) / 2;

    let rects = [];
    if (!isRemoveAll) {
      let r = originalCoord?.find((o) => o.key === object.key);
      if (!r) return;
      rects[0] = r;
    } else {
      rects = [...originalCoord];
    }

    let modifiedRects = rects?.map((v, i) => {
      let temp = [...v?.coordinates];
      temp[0] = -(px * rx) + temp[0] * rx;
      temp[1] = ry - py * ry + temp?.[1] * ry;

      temp[2] = -(px * rx) + temp?.[2] * rx - temp[0];
      temp[3] = ry - py * ry + temp?.[3] * ry - temp[1];
      return temp;
    });

    // console.log(ctx,img)
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fill();
    ctx.fillStyle = "white";
    for (let item of modifiedRects) {
      //  ctx.strokeStyle = "rgba(0,0,0,1)";
      //  ctx.lineWidth = 3;
      // ctx.strokeRect(0, 0, 100, 100);
      ctx.fillRect(item[0], item[1], item[2], item[3]);
    }
    ctx.fill();
    
    ctx.canvas.toBlob(
      (maskImg) => {
        handleDelete(maskImg, object, isRemoveAll);
      },
      "image/jpeg",
      1
    );
    //  console.log(jpegUrl)
    // let maskImg = jpegUrl.slice(jpegUrl?.indexOf(",") + 1);
    //  setDrawPath(modifiedPaths);
    //  setBrushedImage(brushedSrc);
  };

  const drawMask = (object, isRemoveAll) => {
    let dyanmicCanvas = document.createElement("CANVAS");
    var img = document.createElement("IMG");
    img.onload = function () {
      dyanmicCanvas.height = img.height;
      dyanmicCanvas.width = img.width;
      let ctx = dyanmicCanvas.getContext("2d");
      return draw(ctx, img, object, isRemoveAll);
    };
     img.src = URL.createObjectURL(imageData?.originalImage);;
    // let blob = URL.createObjectURL(imageData.originalImage);
    // img.src = blob;
   
  };

    const setImageDataState2 = (response, showToaster, isSetOriginal ,isRemoveAll) => {
      // history.push(data);
      //   setHistory(history.slice(-4))
      try {
        
        if (response.data && !isRemoveAll) {
          let Padding_from_all_sides = JSON.parse(response?.headers?.get(
            "padding_from_all_sides"
          ));
      
          let detectedCoords = response?.headers?.get("coordinates");
          
          let newJson = detectedCoords?.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
          newJson = newJson?.replace(/'/g, '"');
          
          let duplicate = newJson;
          try {
            duplicate = JSON.stringify(removeDuplicate(JSON.parse(duplicate)));
          } catch (ex) {}
          if (showToaster && (JSON.parse(newJson)?.length === 0 || !newJson)) {
            toast.warning("No objects detected");
          }
          setOriginalCoord(JSON.parse(duplicate));
          let padding = {
            top: Padding_from_all_sides[0],
            bottom: Padding_from_all_sides[1],
            left: Padding_from_all_sides[2],
            right: Padding_from_all_sides[3],
          };

          if (isSetOriginal) {
            setTimeout(() => {
              setImageData({
                ...imageData,
                imageHistory: [],
                originalImage: response.data,
                // image: data?.[2]?.Encoded_detected_image,
                // Folder_name_for_masks: data?.[2]?.Folder_name_for_masks,
                coords: JSON.parse(duplicate),
                padding,
              });
            });
          } else {
            let img = new Image();

            img.onload = function () {
              setDetectedDimension({
                height: img.height,
                width: img.width,
              });
              setTimeout(() => {
                setImageData({
                  ...imageData,
                  imageHistory: [],
                  // originalImage: data?.[2]?.Encoded_detected_image,
                  image: response.data,
                  //  Folder_name_for_masks: data?.[2]?.Folder_name_for_masks,
                  coords: JSON.parse(duplicate),
                  padding,
                });
              });
            };
            // if (!imageData.image)
            //   blob = URL.createObjectURL(data?.[2]?.Encoded_detected_image);
            img.src = URL.createObjectURL(response.data);
          }
        }else if (response.data && isRemoveAll) {
          setOriginalCoord([]);
          setTimeout(() => {
            setImageData({
              ...imageData,
              isRemoveAllUsed: 1,
              imageHistory: [],
              originalImage:response?.data || imageData?.originalImage,
              coords: [],
            });
          });
        }
      } catch (ex) {
        setOriginalCoord([]);
        if (showToaster) toast.warning("No objects detected");
        if (isSetOriginal) {
          setTimeout(() => {
            setImageData({
              ...imageData,
              imageHistory: [],
              originalImage:
                response.data || imageData?.originalImage,
              coords: [],
            });
          });
        } else {
          let img = new Image();
          img.onload = function () {
            setDetectedDimension({
              height: img.height,
              width: img.width,
            });
            setTimeout(() => {
              setImageData({
                ...imageData,
                imageHistory: [],
                image: response.data || imageData?.originalImage,
                //  Folder_name_for_masks: data?.[2]?.Folder_name_for_masks,
                coords: [],
              });
            });
          };
          img.src =URL.createObjectURL(  (response.data?.length > 5
              ? response.data
              : imageData?.originalImage));
          

          // let blob = URL.createObjectURL(data?.[2]?.Encoded_detected_image?.length > 5
          //   ? data?.[2]?.Encoded_detected_image
          //   : imageData?.originalImage);
          // img.src = blob;
        }
      }
    };
  const setImageDataState = (data, showToaster, isSetOriginal = true) => {
    // history.push(data);
    //   setHistory(history.slice(-4))
    try {
      let newJson = data?.[0]?.Coordinates?.replace(
        /([a-zA-Z0-9]+?):/g,
        '"$1":'
      );
      newJson = newJson?.replace(/'/g, '"');
      let duplicate = newJson;
      try {
        duplicate = JSON.stringify(removeDuplicate(JSON.parse(duplicate)));
      } catch (ex) {}

      if (data?.[2]?.Encoded_detected_image) {
        if (showToaster && (JSON.parse(newJson)?.length === 0 || !newJson)) {
          toast.warning("No objects detected");
        }
        setOriginalCoord(JSON.parse(duplicate));
        let padding = {
          top: data?.[1]?.Padding_from_all_sides[0],
          bottom: data?.[1]?.Padding_from_all_sides[1],
          left: data?.[1]?.Padding_from_all_sides[2],
          right: data?.[1]?.Padding_from_all_sides[3],
        };

        if (isSetOriginal) {
          setTimeout(() => {
            setImageData({
              ...imageData,
              imageHistory: [],
              originalImage: data?.[2]?.Encoded_detected_image,
              // image: data?.[2]?.Encoded_detected_image,
              // Folder_name_for_masks: data?.[2]?.Folder_name_for_masks,
              coords: JSON.parse(duplicate),
              padding,
            });
          });
        } else {
          let img = new Image();
          img.onload = function () {
            setDetectedDimension({
              height: img.height,
              width: img.width,
            });
            setTimeout(() => {
              setImageData({
                ...imageData,
                imageHistory: [],
                // originalImage: data?.[2]?.Encoded_detected_image,
                image: data?.[2]?.Encoded_detected_image,
                //  Folder_name_for_masks: data?.[2]?.Folder_name_for_masks,
                coords: JSON.parse(duplicate),
                padding,
              });
            });
          };
          let blob = imageData.base64Start + data?.[2]?.Encoded_detected_image;
          // if (!imageData.image)
          //   blob = URL.createObjectURL(data?.[2]?.Encoded_detected_image);
           img.src = blob;
        }
      } else if (data?.[1]?.Encoded_detected_image) {
        setOriginalCoord([]);
        setTimeout(() => {
          setImageData({
            ...imageData,
            isRemoveAllUsed: 1,
            imageHistory: [],
            originalImage:
              data?.[1]?.Encoded_detected_image?.length > 5
                ? data?.[1]?.Encoded_detected_image
                : imageData?.originalImage,
            coords: [],
          });
        });
      }
    } catch (ex) {
      setOriginalCoord([]);
      if (showToaster) toast.warning("No objects detected");
      if (isSetOriginal) {
        setTimeout(() => {
          setImageData({
            ...imageData,
            imageHistory: [],
            originalImage:
              data?.[2]?.Encoded_detected_image?.length > 5
                ? data?.[2]?.Encoded_detected_image
                : imageData?.originalImage,
            coords: [],
          });
        });
      } else {
        let img = new Image();
        img.onload = function () {
          setDetectedDimension({
            height: img.height,
            width: img.width,
          });
          setTimeout(() => {
            setImageData({
              ...imageData,
              imageHistory: [],
              image:
                data?.[2]?.Encoded_detected_image?.length > 5
                  ? data?.[2]?.Encoded_detected_image
                  : imageData?.originalImage,
              //  Folder_name_for_masks: data?.[2]?.Folder_name_for_masks,
              coords: [],
            });
          });
        };
        img.src =
          imageData.base64Start +
          (data?.[2]?.Encoded_detected_image?.length > 5
            ? data?.[2]?.Encoded_detected_image
            : imageData?.originalImage);


          // let blob = URL.createObjectURL(data?.[2]?.Encoded_detected_image?.length > 5
          //   ? data?.[2]?.Encoded_detected_image
          //   : imageData?.originalImage);
          // img.src = blob;   
        
      }
    }
  };

  const removeDuplicate = (objects) => {
 
    // if(!Array.isArray(objects)) return [];
    objects = objects.map((c) => {
      // let increaseX = ((c.coordinates[2]-c.coordinates[0]) * 2) / 100; 
      // let increaseY = ((c.coordinates[2] - c.coordinates[0]) * 2) / 100; 
      let w = c.coordinates[2] - c.coordinates[0];
      let l =c.coordinates[3] - c.coordinates[1]
     let d = Math.sqrt(w*w+l*l)
      let increaseD = d*3/100;
      // let increaseY = ((c.coordinates[3] -c.coordinates[1]) * 2) / 100; 

      c.coordinates[0] = -increaseD+ c.coordinates[0];
      c.coordinates[1] = -increaseD+ c.coordinates[1];
      c.coordinates[2] = increaseD+ c.coordinates[2];
      c.coordinates[3] = increaseD+ c.coordinates[3];
      return c;
    });
    let matched = [];
    let d = objects.filter((c) => {
      if (matched?.some((m) => m.key === c.key)) return false;
      objects.map((t) => {
        if (
          t.key !== c.key &&
          c.coordinates[0] <= t.coordinates[0] + 2 &&
          c.coordinates[0] >= t.coordinates[0] - 2 &&
          c.coordinates[1] <= t.coordinates[1] + 2 &&
          c.coordinates[1] >= t.coordinates[1] - 2 &&
          c.coordinates[2] <= t.coordinates[2] + 2 &&
          c.coordinates[2] >= t.coordinates[2] - 2 &&
          c.coordinates[3] <= t.coordinates[3] + 2 &&
          c.coordinates[3] >= t.coordinates[3] - 2
        ) {
          matched.push(t);
          return t;
        }
      });
      return true;
    });

    return d;
  };

  return (
    <div className="container-fluid position-relative">
      {isGettingImage ? (
        <HomeShimmer />
      ) : !imageData?.image ? (
        <UploadImage
          localSrc={localSrc}
          setLocalSrc={setLocalSrc}
          // setOriginalImage={imageData?.setOriginalImage}
          isGettingImage={isGettingImage}
        />
      ) : (
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
      )}
      {/* <CanvasModal
        setDrawPath={setDrawPath}
        brushData={brushData}
        setBrushData={setBrushData}
        brushedImage={brushedImage}
        isBrushed={isBrushed}
        setIsBrushed={setIsBrushed}
        isBrushing={isBrushing}
        setBrushedImage={setBrushedImage}
        imageDimension={imageDimension}
      /> */}
    </div>
  );
}
