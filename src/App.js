import { RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./assets/css/style.css";
import "./App.css";
import { ImageContext } from "./context/imageContext";
import { useState } from "react";
import { ToastContainer } from "react-toastify";

function App({ router }) {
  const [imageData, setImageData] = useState({
    localBlob: "",
    uploadedImage: "",
    image: "",
    originalImage: "",
    base64Start: "data:image/jpeg;base64,",
    coords: [],
    objectsWithOriginal: [],
    // Folder_name_for_masks: "",
    imageHistory: [],
    currentIndex: 0,
    imageDimension: [0, 0],
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    scale: 1,
    getImage: false,
    isRemoveAllUsed: 0,
  });

  return (
    <div
      className={imageData?.originalImage ? "without-header" : "with-header"}
    >
      <ImageContext.Provider value={[imageData, setImageData]}>
        <ToastContainer autoClose={1000} hideProgressBar={true} />
        <RouterProvider router={router} />
      </ImageContext.Provider>
    </div>
  );
}

export default App;
