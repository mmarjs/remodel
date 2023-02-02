import React, {
  useCallback,
  useContext,
  useEffect,
  useRef
} from "react";
import $ from "jquery";
import "jquery-ui-bundle";
import "jquery-ui-bundle/jquery-ui.min.css";

import { ImageContext } from "../context/imageContext";
window.jQuery = $;

require("jquery-ui-touch-punch");

function DrawObjects({
  c,
  originalCoord,
  zoomRef,
  detectedDimension,
  handleParent,
  isDeletingObject,
  zoomDisable,
  handleObjectClick,
  resetTransform,
  setShowTooltip
}) {

  const [imageData] = useContext(ImageContext);
  const originalCoordRef = useRef({}).current;
  originalCoordRef.value = originalCoord;
  const zoomDisabled = useRef()
  zoomDisabled.value = zoomDisable
  const coordRef = useRef({}).current;
  coordRef.value = imageData.coords;
  const zoomLocal = useRef();
  zoomLocal.value = zoomRef
  const setResizeCoord = useCallback((ui, direction) => {
    try {

      let index = originalCoordRef.value.findIndex((o) => o.key === c.key);
      if (index === -1) return;

      let imageRef = document.getElementById("img-detected");

      let rx = imageRef.clientWidth / (detectedDimension.width);

      let ry =
        imageRef.clientHeight /
        (detectedDimension.height -
          (imageData.padding.top + imageData.padding.bottom));

      let py = (imageData?.padding?.bottom + imageData?.padding?.top) / 2;
      let px = (imageData?.padding?.left + imageData?.padding?.right - rx) / 2;

      let coords = [...originalCoordRef?.value?.[index]?.coordinates];
      let a = document.getElementById(c.key?.replaceAll(" ", ""))

      let width = parseFloat(window.getComputedStyle(a).width)
      let height = parseFloat(window.getComputedStyle(a).height)
      let top = parseFloat(window.getComputedStyle(a).top)
      let left = parseFloat(window.getComputedStyle(a).left)

      coords[0] = (px * rx + left) / rx;
      if (coords[0] < 0) coords[0] = 0;
      else if (coords[0] > detectedDimension.width)
        coords[0] = detectedDimension.width;

      coords[1] = (-ry + py * ry + top) / ry
      if (coords[1] < 0) coords[1] = 0;
      else if (coords[1] > detectedDimension.height)
        coords[1] = detectedDimension.height;

      coords[2] = coords[0] + ((width) / (rx * 100)) * 100
      if (coords[2] < 0) coords[2] = 0;
      else if (coords[2] > detectedDimension.width)
        coords[2] = detectedDimension.width;

      coords[3] =
        ((py * ry - ry + top + height) / (ry * 100)) *
        100
      if (coords[3] < 0) coords[3] = 0;
      else if (coords[3] > detectedDimension.height)
        coords[3] = detectedDimension.height;

      originalCoordRef.value[index].coordinates = [...coords];

      handleParent();
    } catch (ex) { }
  }, []);

  useEffect(() => {
    $(function () {
      $("#" + c.key?.replaceAll(" ", "")).resizable({
        handles: "all",
        containment: ".cursor-pan",
        disabled: true,
        stop: function (event, ui) {
          var direction = $(this).data("ui-resizable").axis;
          setResizeCoord(ui, direction);
        },
        start: function (event, ui) {
          resetTransform()
          this.div2pos = $("#" + c.key?.replaceAll(" ", "")).offset();
        },
        resize: function (e, ui) {
          var pos = this.div2pos;
          let height = ui.size.height;
          var left = ui.position.left - ui.originalPosition.left;
          var top = ui.position.top - ui.originalPosition.top;
          let width = ui.size.width;

          $("#" + c.key?.replaceAll(" ", "")).offset({
            top: pos.top + top,
            left: pos.left + left,
          });
          $("#" + c.key?.replaceAll(" ", "")).width(width);
          $("#" + c.key?.replaceAll(" ", "")).height(height);
        },
      })
    });
    setTimeout(()=>{
       $(".ui-resizable-handle").on("mousedown", () => {
         !zoomDisabled.value ? setShowTooltip(true) : setShowTooltip(false);
       }); 
        $(".ui-resizable-handle").on("mouseup", () => {
          setShowTooltip(false);
        }); 
    })
  }, []);

  useEffect(() => {
    setTimeout(() => {
      $("#" + c.key?.replaceAll(" ", "")).resizable(
        (isDeletingObject || !zoomDisable) ? "disable" : "enable"
      );
    })
  }, [isDeletingObject, zoomDisable])

  return (
    <div>
      <div
        id={c.key?.replaceAll(" ", "")}
        className={"position-absolute object-box"}
        style={{
          top: c.coordinates[1] + "px",
          left: c.coordinates[0] + "px",
          width: c.coordinates[2] - c.coordinates[0] + "px",
          height: c.coordinates[3] - c.coordinates[1] + "px",
          borderColor: `rgb(${c.color?.join(",")})`,
        }}
      >
        <div className="position-relative">
          <div
            className="position-absolute object-box-key text-truncate"
            style={{
              backgroundColor: `rgb(${c?.color?.join(",")})`,
            }}
          >
            {c?.key?.slice(
              0,
              c?.key?.indexOf("0") > -1 ? c?.key?.indexOf("0") : c?.key?.length
            )}
          </div>
          <div
            className="position-absolute object-button text-primary cursor-pointer"
            style={{
              zIndex: isDeletingObject ? 0 : 91,
            }}
            onClick={() => (!isDeletingObject ? handleObjectClick(c) : "")}
          >
            <i className="bi bi-x-circle-fill  hover-danger"></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrawObjects;
