import React, { useContext, useEffect, useRef, useState } from "react";
import headingImg from "../assets/img/underline.svg";
import { ImageContext } from "../context/imageContext";
import { Constants } from "../data/constants";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import Resizer from "react-image-file-resizer";
import $ from "jquery";
const urlStart = "/sample/";

function UploadImage({ isGettingImage, localSrc, setLocalSrc }) {
  const [imageData, setImageData] = useContext(ImageContext);
  const [isCompressing, setIsCompressing] = useState(false);
  const image = useRef();

  useEffect(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
    const images = Constants.sampleImages?.map((sample) => 
       urlStart + sample?.originalUrl
    );

    $(images).each(function () {
      $("<img  loading=eager/>").attr("src", this);
    });

  }, []);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUrl = async (startUrl, url) => {
    if (isGettingImage || isCompressing) return;
    fetch(startUrl+url)
      .then(res => res.blob()) 
      .then(blob => {
        handleFile(blob)
      });
  };

  const handleFile = async (file) => {
    if (isCompressing || isGettingImage || !Constants.allowedTypes.includes(file?.type)) return;
    let data = file;
    if(file.type !=='image/jpeg' && file.type !=='image/jpg')
     data = new Blob([file], {type:'image/jpeg'});   

    if (data?.size / (1024 * 1024) >= 19) {
      await compressImage(data);
    } else {
      proceed(data);
    }
  };

  const compressImage = async (file) => {
    try {
      setIsCompressing(true);
      let option = {
        maxSizeMB: 15,
        alwaysKeepResolution: false,
        fileType: "image/jpeg",
      };
      let compressedFile = await imageCompression(file, option);
      if (compressedFile) {
        let bmp = await createImageBitmap(compressedFile);
        if (16 * 1000000 > bmp.width * bmp.height) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const newWidth = Math.round(
            Math.sqrt((5000000 * bmp.width) / bmp.height)
          );
          const newHeight = Math.round(
            Math.sqrt((5000000 * bmp.height) / bmp.width)
          );

          canvas.width = newWidth;
          canvas.height = newHeight;
          let bitmap = await createImageBitmap(compressedFile);

          ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
          
            ctx.canvas.toBlob(
              (resizedImageData) => {
                proceed(resizedImageData);
              },
              "image/jpeg",
              1
            );
        } else {
          proceed(compressedFile);
        }
      }
    } catch (ex) {
      toast.error("Unsupported Image !");
      setIsCompressing(false);
    }
  };  

  const resizeFile = (file) =>{
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      getDimension()?.maxWidth || 1024,
      getDimension()?.maxHeight || 1024,
      "JPEG",
      100,
      0,
      (uri) => {
        resolve(uri);
      },
      "blob"
    );
  });
  }

  const proceed = async (data) => {
    setIsCompressing(false);
     let compressedFile = await resizeFile(data);
    setImageData({
      ...imageData,
      originalImage: compressedFile,
      getImage: !imageData.getImage,
    });
  };

  const getDimension = ()=>{
    return {maxWidth:1024,maxHeight:1024}
  }
  useEffect(() => {
    const image_drop_area = document.querySelector("#image_drop_area");
    if (!image_drop_area) return;
    image_drop_area?.addEventListener("dragover", (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (!isGettingImage && !isCompressing) {
        image_drop_area.style.borderColor = "#00C";
        event.dataTransfer.dropEffect = "copy";
      }
    });

    image_drop_area.addEventListener("drop", (event) => {
      event.stopPropagation();
      event.preventDefault();
      image_drop_area.style.borderColor = "#656565";
      if (!isGettingImage && !isCompressing) {
        const fileList = event?.dataTransfer?.files;
        if (fileList?.[0]) handleFile(fileList?.[0]);
      }
    });

    image_drop_area.addEventListener("dragleave", (event) => {
      event.stopPropagation();
      event.preventDefault();
      image_drop_area.style.borderColor = "#656565";
    });
  }, [localSrc]);
  
  return (
    <section
      className={` text-center py-5  py-lg-0  py-xxl-5 ipad-height ${
        !localSrc ? "my-md-3 my-lg-0 my-xxl-5" : ""
      }`}
    >
      <div
        className={`container py-md-5 py-lg-5 my-md-5 my-lg-0  ${
          !localSrc ? "my-xxl-5" : ""
        }`}
      >
        <div className={`row`}>
          <div className="col-md-11 col-lg-8 mx-auto px-md-0">
            <div className="position-relative d-inline-block mb-4 py-1">
              <h2 className="fw-bold mb-3 d-md-flex">
                <span className="text-danger me-2">Redesign </span> your space
                <img
                  src={headingImg}
                  alt="img"
                  className="img-fluid bottom-0 position-absolute text-heading"
                />
              </h2>
            </div>
            <div className="w-100">
              {!localSrc && (
                <div>
                  <div className="file file-upload mt-3 mt-md-5 position-relative ">
                    <label
                      htmlFor="input-file"
                      className="w-100 cursor-pointer d-flex align-items-center justify-content-center flex-wrap"
                      id="image_drop_area"
                    >
                      <div className="text-center">
                        <div className="w-100 fw-semibold etxt-center">
                          {isCompressing ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>{" "}
                              Compressing...
                            </>
                          ) : (
                            "Click here or drag an image file"
                          )}
                        </div>
                      </div>
                    </label>
                    {!isCompressing ? (
                      <input
                        id="input-file"
                        ref={image}
                        onChange={(e) => handleChange(e)}
                        type="file"
                        disabled={isGettingImage || isCompressing}
                        accept={Constants.allowedTypes.join(",")}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="sample-images mt-4 pt-1">
                    <div className="mt-5 fw-semibold etxt-center fs-5">
                      <i className="text-upload bi bi-arrow-down"></i>
                      <span className="text-upload"> Try with an example </span>
                    </div>
                    <div className="mt-4 row justify-content-center">
                      {Constants.sampleImages?.map((sample) => {
                        return (
                          <div
                            className="col-2 sub-image-height"
                            key={sample.name}
                          >
                            <img
                              loading="eager"
                              onClick={() =>
                                handleUrl(urlStart, sample?.originalUrl)
                              }
                              src={urlStart + sample?.thumbnailUrl}
                              className={
                                "img-fluid sample-img rounded" +
                                (isCompressing || isGettingImage
                                  ? " restricted-img"
                                  : "")
                              }
                              alt="img"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UploadImage;
