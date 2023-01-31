import React, { useContext } from "react";
import { toast } from "react-toastify";
import { ImageContext } from "../context/imageContext";
import { abortImageServices } from "../services/imageServices";
import { getBrushSize } from "../utils/getBrushSize";

function Toolbar({
  brushData,
  setBrushData,
  isDeletingObject,
  isBrushed,
  setIsBrushed,
  isBrushing,
  handleParent,
  handleDone,
  canvasData,
}) {
  const [imageData, setImageData] = useContext(ImageContext);

  const handleBrushMode = () => {
    if (isDeletingObject || isBrushing || !brushData.brushMode) return;
    setBrushData({ ...brushData, brushMode: false });
    if (isBrushed) {
      setIsBrushed(false);
      if (!imageData.coords?.length) toast.warning("No objects detected");
    }
    abortImageServices();
    handleParent();
  };

  const handleBrushClick = () => {
    if (isDeletingObject || isBrushing || brushData.brushMode) return;
    setBrushData({
      ...brushData,
      brushMode: true,
      brushStock: getBrushSize(),
    });
    abortImageServices();
    handleParent();
  };

  return (
    <>
      <div className="row er-section">
        <div className="col float-start float-md-none er-col mb-2">
          <button
            className={
              "btn switch-btn me-2 tool-btn" +
              (isDeletingObject || isBrushing ? " loading-image " : "") +
              (!brushData.brushMode ? " btn-danger" : "")
            }
            onClick={handleBrushMode}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-bounding-box"
              viewBox="0 0 16 16"
            >
              <path d="M5 2V0H0v5h2v6H0v5h5v-2h6v2h5v-5h-2V5h2V0h-5v2H5zm6 1v2h2v6h-2v2H5v-2H3V5h2V3h6zm1-2h3v3h-3V1zm3 11v3h-3v-3h3zM4 15H1v-3h3v3zM1 4V1h3v3H1z" />
            </svg>
          </button>
        </div>
        <div className="col float-start float-md-none er-col mb-2">
          <button
            className={
              "btn switch-btn me-2 tool-btn" +
              (isDeletingObject || isBrushing ? " loading-image " : "") +
              (brushData.brushMode ? " btn-danger" : "")
            }
            onClick={() => {
              handleBrushClick();
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 13L1.34921 12.2407C1.16773 12.3963 1.04797 12.6117 1.01163 12.8479L2 13ZM22.5 4L23.49 4.14142C23.5309 3.85444 23.4454 3.5638 23.2555 3.3448C23.0655 3.1258 22.7899 3 22.5 3V4ZM12.5 4V3C12.2613 3 12.0305 3.08539 11.8492 3.24074L12.5 4ZM1 19.5L0.0116283 19.3479C-0.0327373 19.6363 0.051055 19.9297 0.241035 20.1511C0.431014 20.3726 0.708231 20.5 1 20.5V19.5ZM11.5 19.5V20.5C11.7373 20.5 11.9668 20.4156 12.1476 20.2619L11.5 19.5ZM21.5 11L22.1476 11.7619C22.3337 11.6038 22.4554 11.3831 22.49 11.1414L21.5 11ZM2 14H12.5V12H2V14ZM13.169 13.7433L23.169 4.74329L21.831 3.25671L11.831 12.2567L13.169 13.7433ZM22.5 3H12.5V5H22.5V3ZM11.8492 3.24074L1.34921 12.2407L2.65079 13.7593L13.1508 4.75926L11.8492 3.24074ZM1.01163 12.8479L0.0116283 19.3479L1.98837 19.6521L2.98837 13.1521L1.01163 12.8479ZM1 20.5H11.5V18.5H1V20.5ZM12.4884 19.6521L13.4884 13.1521L11.5116 12.8479L10.5116 19.3479L12.4884 19.6521ZM21.51 3.85858L20.51 10.8586L22.49 11.1414L23.49 4.14142L21.51 3.85858ZM20.8524 10.2381L10.8524 18.7381L12.1476 20.2619L22.1476 11.7619L20.8524 10.2381Z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
        </div>
        {brushData.brushMode && (
        <>
          <div className="col mb-2">
            <div className="bg-scroller px-4 py-2 rounded w-230px">
              <input
                min="20"
                max="110"
                type="range"
                value={brushData.brushStock}
                onChange={(e) =>
                  setBrushData({
                    ...brushData,
                    brushStock: e.target.valueAsNumber,
                  })
                }
                className="form-range pt-2"
                id="customRange1"
              />
            </div>
          </div>
        <div className="col">
          <button
            disabled={isBrushing || !canvasData?.path?.length}
            onClick={() => (canvasData?.path?.length  && !isBrushing? handleDone() : "")}
            className="btn btn-danger btn-sm remove-all tool-btn px-4"
          >
            Done
          </button>
        </div></>
        )}
      </div>
    </>
  );
}

export default Toolbar;
