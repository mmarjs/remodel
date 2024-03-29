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
import HomeShimmer from "../components/shimmer/homeShimmer";
import { Constants } from "../data/constants";
import { getBrushSize } from "../utils/getBrushSize";

export default function Home() {
  const [imageData, setImageData] = useContext(ImageContext);
  const [history, setHistory] = useState([]);
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

  useEffect(() => {
    if (imageData.originalImage) {
      let img = new Image();
      img.onload = function () {
        setImageDimension({ height: img?.height, width: img?.width });
      };

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

      form.append("remove_all", isRemoveAll ? 1 : 0);
      form.append("mask_image", maskImg);
      form.append("original_image", imageData?.originalImage);

      const response = await removeObject(form);
      setImageDataState(response, true,true,isRemoveAll);
      if (isRemoveAll && !response?.headers?.get("coordinates")) {
        setBrushData({
          ...brushData, 
          brushMode: true,
          brushStock: getBrushSize()
        });
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
      form.append(
        "check_user_used_remove_all_or_not",
        imageData?.isRemoveAllUsed
      );

      const response = await removeFromBrush(form);
      if (imageData?.coords?.length) setIsBrushed(true);
      setImageDataState(response, false,true,false);
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
      let response  = await getImage(form);
     
        setImageDataState(response, true, false,false);

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

    let modifiedRects = rects?.map((v) => {
      let temp = [...v?.coordinates];
      temp[0] = -(px * rx) + temp[0] * rx;
      temp[1] = ry - py * ry + temp?.[1] * ry;
      temp[2] = -(px * rx) + temp?.[2] * rx - temp[0];
      temp[3] = ry - py * ry + temp?.[3] * ry - temp[1];
      return temp;
    });

    // ctx.drawImage(img, 0, 0);
    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.fill();

    ctx.fillStyle = "white";
    for (let item of modifiedRects) {
      ctx.fillRect(item[0], item[1], item[2], item[3]);
    }
    ctx.fill();
    
    ctx.canvas.toBlob(
      (maskImg) => {
        // console.log("maskImg", maskImg) //Blob {size: 8514, type: 'image/jpeg'}
        handleDelete(maskImg, object, isRemoveAll);
      },
      "image/jpeg",
      1
    );
  };

  const drawMask = (object, isRemoveAll) => {
    let dynamicCanvas = document.createElement("CANVAS");
    var img = document.createElement("IMG");
    img.src = URL.createObjectURL(imageData?.originalImage);
    img.onload = function () {
      dynamicCanvas.height = img.height;
      dynamicCanvas.width = img.width;
      let ctx = dynamicCanvas.getContext("2d");
      return draw(ctx, img, object, isRemoveAll);
    };
  };

  const setImageDataState = (response, showToaster, isSetOriginal ,isRemoveAll) => {
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
          setBrushData({
            ...brushData,
            brushMode: true,
            brushStock: getBrushSize()
          });
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
                image: response.data,
                coords: JSON.parse(duplicate),
                padding,
              });
            });
          };
          img.src = URL.createObjectURL(response.data);
        }
      } else if (response.data && isRemoveAll) {
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
              coords: [],
            });
          });
        };
        img.src =URL.createObjectURL((response.data?.length > 5
            ? response.data
            : imageData?.originalImage));
      }
    }
  };

  const removeDuplicate = (objects) => {
 
    objects = objects.map((c) => {
      let w = c.coordinates[2] - c.coordinates[0];
      let l =c.coordinates[3] - c.coordinates[1]
      let d = Math.sqrt(w*w+l*l)
      let increaseD = d*3/100;

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
        // return matched;
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
          setHistory={setHistory}
          brushedImage={brushedImage}
          isBrushing={isBrushing}
          setBrushedImage={setBrushedImage}
          setDrawPath={setDrawPath}
        ></ImagePreview>
      )}
    </div>
  );
}
