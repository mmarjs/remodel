import React, { useContext } from "react";
import { ImageContext } from "../context/imageContext";
import Toolbar from "./toolbar";
import ZoomTools from "./zoomTools";

function Tools({
  zoomIn,
  zoomOut,
  resetTransform,
  brushData,
  setBrushData,
  isDeletingObject,
  handleObjectClick,
  isDeletingAll,
  isBrushed,
  setIsBrushed,
  handleParent,
  showTooltip,
  setShowTooltip,
  canvasData,
  handleDone,isBrushing
}) {
  const [imageData] = useContext(ImageContext);
  return (
    <div className="row">
      {!brushData.brushMode ? (
        <div className="col d-flex mt-4">
          <ZoomTools
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetTransform={resetTransform}
          />
        </div>
      ) : (
        <></>
      )}
      <div
        className={
          "d-flex col mt-4" +
          (imageData?.coords?.length || brushData.brushMode
            ? " justify-content-center"
            : " justify-content-start")
        }
      >
        <Toolbar
          handleParent={handleParent}
          isBrushed={isBrushed}
          setIsBrushed={setIsBrushed}
          brushData={brushData}
          setBrushData={setBrushData}
          isDeletingObject={isDeletingObject}
          canvasData={canvasData}
          handleDone={handleDone}
          isBrushing={isBrushing}
        />
        {/* <div className="ms-3 d-grid align-items-center mt-4">
          <button
            className="btn btn-secondary"
            disabled={history?.length < 2 || isUndoing || isDeletingObject}
            onClick={handleUndo}
          >
            {isUndoing?'Undoing':
            <i className="bi bi-arrow-counterclockwise"></i>
}
          </button>
        </div> */}
        {/* <button
          className="btn btn-primary"
          disabled={history?.length < 2}
          onClick={handleRedo}
        >
          Redo
        </button> */}
        {/* <div className="ml-auto">
                      <Share />
                    </div> */}
      </div>
      {imageData?.coords?.length && !brushData.brushMode ? (
        <div className="col d-flex justify-content-end mt-4">
          <button
            disabled={isDeletingObject}
            onClick={() =>
              !isDeletingObject && !isDeletingAll
                ? handleObjectClick({}, true)
                : ""
            }
            className="btn btn-danger btn-sm remove-all tool-btn"
          >
            <div className="w-100 align-items-center d-flex">
              {isDeletingAll ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Removing....
                </>
              ) : (
                <span> Remove All</span>
              )}
            </div>
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Tools;
