import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
  } from "react";
  // import './resize.css'
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
    percentageChange,
    zoomDisable,
    handleObjectClick,
    setZoomDisable,
    resetTransform,
    setShowTooltip
  }) {
    const [showKey, setShowKey] = useState(true);
    const [position, setPosition] = useState({left:0,top:0});
    const [coordinates, setCoordinates] = useState([]);
    const [objectName, setObjectName] = useState('');
    const [imageData] = useContext(ImageContext);
  
    const originalCoordRef = useRef({}).current;
    originalCoordRef.value = originalCoord;
    const zoomDisabled = useRef()
    zoomDisabled.value = zoomDisable
    const coordRef = useRef({}).current;
    coordRef.value = imageData.coords;
    const zoomLocal = useRef();
    zoomLocal.value = zoomRef
  
  useEffect(() => {
    var objectName = c?.key;
  
    var objectCoordinates = [
      {x: c.coordinates[0], y: c.coordinates[1]}, 
      {x: c.coordinates[2], y: c.coordinates[1]}, 
      {x: c.coordinates[2], y: c.coordinates[3]}, 
      {x: c.coordinates[0], y: c.coordinates[3]}
    ];
  
    console.log("aaaa", objectCoordinates)
    setObjectName(objectName);
    setCoordinates(objectCoordinates);
  
    $(function () {
      var points = objectCoordinates;
      for(var i = 0; i < points.length; i ++){
        (function(i){
          var point =points[i];
          console.log("aaa", point)
  
          var parentDiv = $("#cursor-pan");
          var base = parentDiv.position();
          console.log("base", base)
  
          var handle = document.createElement("div");
          handle.className = "handle";
          $("#cursor-pan").append(handle);
          
          var cs = window.getComputedStyle(handle, null);
          console.log("cs", cs.width, cs.borderLeftWidth, cs.borderRightWidth)
          base.left -= (parseInt(cs.width) + parseInt(cs.borderLeftWidth) + parseInt(cs.borderRightWidth))/2; 
          // console.log("444", base.left)
          base.top -= (parseInt(cs.height) + parseInt(cs.borderTopWidth) + parseInt(cs.borderBottomWidth))/2; 
    
          handle.style.left = base.left + point.x + "px";
          // console.log("left", handle.style.left);
          handle.style.top = base.top + point.y + "px";
          // console.log("top", handle.style.top);
          var dynamicCanvas = document.createElement("CANVAS");
          var img = document.createElement("IMG");
          img.src = URL.createObjectURL(imageData?.originalImage);
          img.onload = function () {
            dynamicCanvas.height = img.height;
            dynamicCanvas.width = img.width;
          };
          var ctx = dynamicCanvas.getContext("2d");
          ctx.lineWidth = 10;
          ctx.strokeRect(200, 200, 50, 50);
          ctx.fill()
          console.log("34343434")
          // console.log("ctx", dynamicCanvas)
          $(handle).draggable({
            drag: function (event) {
              setTimeout(function () { // jQuery apparently calls this *before* setting position, so defer
                  var left = parseInt(handle.style.left) - base.left;
                  var top = parseInt(handle.style.top) - base.top;
                  console.log("asdfasdfasdf")
                // console.log("newpoint1", c.coordinates[1])
                // setObjectName({
                //   ...objectName, 
                //   name: c?.key, 
                // });
                var tempArr = [...coordinates];
                if(tempArr[i]){
                  
                  tempArr[i].x = left;
                  tempArr[i].y = top;
                  
                 
                  // ctx.fillStyle = '#f00';
                  // ctx.beginPath();
                  // ctx.moveTo(tempArr[0].x, tempArr[0].y);
                  // ctx.lineTo(tempArr[1].x, tempArr[1].y);
                  // ctx.lineTo(tempArr[2].x, tempArr[2].y);
                  // ctx.lineTo(tempArr[3].x, tempArr[3].y);
                  // ctx.closePath();
                  // console.log("asdfasdfasdf")
                  ctx.fill();
                }
                
  
                setCoordinates(tempArr);
  
              },0);
            }
          });
          }(i)
        );
  
      }
    });
   
  }, [c])
  
    // useEffect(() => {
    //   // setTimeout(() => {
    //   //   $("#" + c.key?.replaceAll(" ", "")).resizable(
    //   //     (isDeletingObject || !zoomDisable) ? "disable" : "enable"
    //   //   );
    //   // })
    // }, [isDeletingObject, zoomDisable])
  
    console.log("coordinates", coordinates)
    return (
      <div>
        {coordinates&&objectName&&<div
          id={c?.key?.replaceAll(" ", "")}
          className={"position-absolute object-box"}
          // onMouseDown={() => {!zoomDisable? setShowTooltip(true):setShowTooltip(false);}}
          // onMouseUp={() => setShowTooltip(false)}
          style={{
            top: c.coordinates[1] + "px",
            left: c.coordinates[0] + "px",
            width: c.coordinates[2] - c.coordinates[0] + "px",
            height: c.coordinates[3] - c.coordinates[1] + "px",
            borderColor: `rgb(${c.color?.join(",")})`,
          }}
          // style={{
          //   top: coordinates[0]?.y + "px",
          //   left: coordinates[0]?.x + "px",
          //   width: coordinates[1]?.x - coordinates[0]?.x + "px",
          //   height: coordinates[2]?.y - coordinates[0]?.y + "px",
          //   borderColor: `rgb(${c.color?.join(",")})`,
          // }}
          // points={`${c.coordinates[0]},${c.coordinates[1]} ${c.coordinates[2]},${c.coordinates[1]} ${c.coordinates[2]},${c.coordinates[3]} ${c.coordinates[0]},${c.coordinates[3]}`}
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
        }
      </div>
    );
  }
  
  export default DrawObjects;
  