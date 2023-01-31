import React, { useRef } from "react";

function ZoomTools({
  zoomIn,
  zoomOut,
  resetTransform,
  showTooltip = false,
  setShowTooltip,
}) {
  const ref = useRef();
  return (
    <div className="tools">
      <button
        className="btn btn-primary me-2 mb-2 tool-btn float-start float-md-none"
        onClick={() => zoomIn()}
      >
        <i className="bi bi-zoom-in"></i>
      </button>
      <button
        className="btn btn-danger me-2 mb-2 tool-btn float-start float-md-none"
        onClick={() => zoomOut()}
      >
        <i className="bi bi-zoom-out"></i>
      </button>
      <button ref={ref}
        className="btn btn-secondary mb-2 tool-btn float-start float-md-none"
        onClick={() => resetTransform()}
      >
        Reset
      </button>
      {showTooltip?<div className="po" >Disable zoom-in to resize</div>:''}
      {/* <Overlay target={ref} show={showTooltip} placement="right">
        {(props) => (
          <Tooltip id="overlay-example" {...props}>
            My Tooltip
          </Tooltip>
        )}
      </Overlay> */}
    </div>
  );
}

export default ZoomTools;
