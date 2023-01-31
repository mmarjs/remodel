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
    // let element = document.getElementById("proceed");
    // element?.scrollIntoView({ block: "start", behavior: "smooth" });
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
    const images = Constants.sampleImages?.map((sample) => 
       urlStart + sample?.originalUrl
    );

    $(images).each(function () {
      let image = $("<img  loading=eager/>").attr("src", this);
    });
  }, []);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const previewImage = (data) => {
    setLocalSrc(data);
    setTimeout(() => {
      let element = document.getElementById("proceed");
      element?.scrollIntoView({ block: "end", behavior: "smooth" });
    });
  };

  const handleUrl = async (startUrl, url) => {
    if (isGettingImage || isCompressing) return;
    fetch(startUrl+url)
      .then(res => res.blob()) 
      .then(blob => {
        handleFile(blob)
      });
    
    // let img = new Image();
    // img.onload = () => {
    //   let canvas = document.createElement("canvas");
    //   let ctx = canvas.getContext("2d");
    //   ctx.canvas.height = img.height;
    //   ctx.canvas.width = img.width;
    //   ctx.drawImage(img, 0, 0);

    //   let jpegUrl = ctx.canvas.toDataURL("image/jpeg");
    //   proceed(jpegUrl);
    //   // previewImage(jpegUrl);
    // };
    // img.src = url;
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
    //  convertToBase64(file);
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
          // const resizedImageData = canvas.toDataUrl("image/jpeg", 1);
        } else {
          proceed(compressedFile);
        }
      }
    } catch (ex) {
      toast.error("Unsupported Image !");
      setIsCompressing(false);
    }
  };  

  const convertToBase64 = async (file) => {
    try {
      // let compressedFile = await resizeFile(file);
   
      setIsCompressing(false);
      // proceed(compressedFile)
       let reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = async function () {
         proceed(reader.result);
         //  previewImage(reader.result);
       };
       reader.onerror = function (error) {
         //  console.log("Error: ", error);
       };
    } catch (ex) {
      setIsCompressing(false);
      toast.error("Unsupported Image !");
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

  const emptyImage = () => {
    setLocalSrc("");
    if (image?.current?.value) image.current.value = "";
    setTimeout(() => {
      window.scroll({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  const proceed = async (data) => {
    setIsCompressing(false);
     let compressedFile = await resizeFile(data);
    // let base64 = image?.slice(image?.indexOf(",") + 1);
    // let start = image?.slice(0, image?.indexOf(",") + 1);
    setImageData({
      ...imageData,
      originalImage: compressedFile,
      getImage: !imageData.getImage,
    });
    // let url = URL.createObjectURL(compressedFile)
    //   let reader = new FileReader();
    //    reader.readAsDataURL(url);
    //    reader.onload = async function () {
    //      proceed(reader.result);
    //      //  previewImage(reader.result);
    //    };
    //    reader.onerror = function (error) {
    //      //  console.log("Error: ", error);
    //    };
    //  await handleConversion();
    // let data = image?.slice(image?.indexOf(",") + 1);
    // let start = image?.slice(0, image?.indexOf(",") + 1);

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
              {/* <button
                type="button"
                disabled={isGettingImage}
                onClick={()=>setOriginalImage(Constants.base64Image)}
                className="btn btn-primary text-uppercase btn-theme fw-bold font-nunito"
              >
                {isGettingImage ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span> Loading... </span>
                  </>
                ) : (
                  <span>See Examples</span>
                )}
              </button> */}
              {!localSrc && (
                <div>
                  <div className="file file-upload mt-3 mt-md-5 position-relative ">
                    <label
                      htmlFor="input-file"
                      className="w-100 cursor-pointer d-flex align-items-center justify-content-center flex-wrap"
                      id="image_drop_area"
                    >
                      <div className="text-center">
                        {/* <img
                        src={uploadicon}
                        alt="upload"
                        className="img-fluid mb-3"
                      /> */}

                        {/* <svg
                        id="pic"
                        width="76"
                        height="76"
                        viewBox="0 0 76 76"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1_71)">
                          <path d="M15.2887 66.5L15.2253 66.5633L15.1588 66.5H9.47468C8.64125 66.4992 7.84225 66.1675 7.25323 65.5779C6.6642 64.9883 6.33334 64.1889 6.33334 63.3555V12.6445C6.33914 11.8129 6.67186 11.0169 7.25963 10.4285C7.84741 9.84016 8.64305 9.50663 9.47468 9.5H66.5253C68.2607 9.5 69.6667 10.9092 69.6667 12.6445V63.3555C69.6609 64.1871 69.3282 64.9831 68.7404 65.5715C68.1526 66.1598 67.357 66.4934 66.5253 66.5H15.2887ZM63.3333 47.5V15.8333H12.6667V60.1667L44.3333 28.5L63.3333 47.5ZM63.3333 56.4553L44.3333 37.4553L21.622 60.1667H63.3333V56.4553ZM25.3333 34.8333C23.6536 34.8333 22.0427 34.1661 20.855 32.9783C19.6673 31.7906 19 30.1797 19 28.5C19 26.8203 19.6673 25.2094 20.855 24.0217C22.0427 22.8339 23.6536 22.1667 25.3333 22.1667C27.013 22.1667 28.624 22.8339 29.8117 24.0217C30.9994 25.2094 31.6667 26.8203 31.6667 28.5C31.6667 30.1797 30.9994 31.7906 29.8117 32.9783C28.624 34.1661 27.013 34.8333 25.3333 34.8333Z" />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_71">
                            <rect width="76" height="76" fill="white" />
                          </clipPath>
                        </defs>
                      </svg> */}

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
      {/* {localSrc && (
        <div className="container w-100">
          <div className="col-10 mx-auto d-flex justify-content-center align-items-center position-relative ">
            <img
              src={localSrc}
              className="image-container img-fluid rounded" loading="lazy"
              id="imgCon"
              alt="img"
            />
          </div>
          <div className=" d-flex justify-content-center mt-5">
            <button
              className="btn btn-danger me-2"
              onClick={emptyImage}
              disabled={isGettingImage}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => proceed()}
              disabled={isGettingImage}
            >
              <div className="w-100  etxt-center">
                {isGettingImage ? (
                  "Uploading...."
                ) : (
                  <>
                    <span>Redesign the room</span>
                    <i className="bi bi-arrow-right ms-2"></i>
                  </>
                )}
              </div>
            </button>
          </div>
          <div className="mt-3" id="proceed"></div>
        </div>
      )} */}
    </section>
  );
}

export default UploadImage;
