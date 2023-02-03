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
  const [init,setInit] = useState(false);
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
  const linedraw = (coordinates,obj,i) =>{
    console.log(obj,'ddddd')
    if(obj){
      let ax = coordinates[i]?.x;
      let ay = coordinates[i]?.y;
      let bx = coordinates[(i+1)%4]?.x;
      let by = coordinates[(i+1)%4]?.y;
      var length=Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
      var calc=90+Math.atan2((ay-by),(ax-bx))* 180 / Math.PI;
      // console.log(calc)
      $(`.line_${obj}_${i}`).remove();
      $("#cursor-pan").append( `<div class='line_${obj}_${i}' style='height:${length}px;width:5px;background-color: rgb(${c.color?.join(",")});position:absolute;top:` + (ay+2) + "px;left:" + (ax-2) + "px;transform:rotate(" + calc + "deg);-ms-transform:rotate(" + calc + "deg);transform-origin:0% 0%;-moz-transform:rotate(" + calc + "deg);-moz-transform-origin:0% 0%;-webkit-transform:rotate(" + calc  + "deg);-webkit-transform-origin:0% 0%;-o-transform:rotate(" + calc + "deg);-o-transform-origin:0% 0%;'></div>");
    }
  }
useEffect(() => {
  if(init){
    var objectName = c?.key;
  
    var objectCoordinates = [
      {x: c.coordinates[0], y: c.coordinates[1]}, 
      {x: c.coordinates[2], y: c.coordinates[1]}, 
      {x: c.coordinates[2], y: c.coordinates[3]}, 
      {x: c.coordinates[0], y: c.coordinates[3]}
    ];
  
    setObjectName(objectName);
    setCoordinates(objectCoordinates);
    
    $(function () {
      var coordinates = objectCoordinates;
      
      for(var i = 0; i < coordinates.length; i ++){
        
        linedraw(coordinates,objectName,i);
        (function(i){
          var point =coordinates[i];
  
          var parentDiv = $("#cursor-pan");
          var base = parentDiv.position();
  
          var handle = document.createElement("div");
          handle.className = `handle point_${i}`;
          handle.id = objectName;
          handle.style.zIndex = 2000;
          handle.style.background =  `rgb(${c.color?.join(",")})`;
          handle.style.cursor = 'move';

          // remove point if exist
          $(`#${objectName}.point_${i}`).remove()
          $("#cursor-pan").append(handle);
          var cs = window.getComputedStyle(handle, null);
          base.left -= (parseInt(cs.width) + parseInt(cs.borderLeftWidth) + parseInt(cs.borderRightWidth))/2; 
          base.top -= (parseInt(cs.height) + parseInt(cs.borderTopWidth) + parseInt(cs.borderBottomWidth))/2; 
    
          handle.style.left = base.left + point.x + "px";
          handle.style.top = base.top + point.y + "px";
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
          $(handle).draggable({
            drag: function (event) {
              setTimeout(function () { // jQuery apparently calls this *before* setting position, so defer
                  var left = parseInt(handle.style.left) - base.left;
                  var top = parseInt(handle.style.top) - base.top;
                // setObjectName({
                //   ...objectName, 
                //   name: c?.key, 
                // });
                var tempArr = [...coordinates];
                if(tempArr[i]){
                  
                  tempArr[i].x = left;
                  tempArr[i].y = top;
                  setCoordinates(tempArr);
                  
                  // ctx.fillStyle = '#f00';
                  // ctx.beginPath();
                  // ctx.moveTo(tempArr[0].x, tempArr[0].y);
                  // ctx.lineTo(tempArr[1].x, tempArr[1].y);
                  // ctx.lineTo(tempArr[2].x, tempArr[2].y);
                  // ctx.lineTo(tempArr[3].x, tempArr[3].y);
                  // ctx.closePath();
                  ctx.fill();
                }
                
                // linedraw(coordinates[i].x,coordinates[i].y,coordinates[(i+1)%4].x,coordinates[(i+1)%4].y);
                // linedraw(coordinates[(i-1)%4].x,coordinates[(i-1)%4].y,coordinates[i].x,coordinates[i].y);

                setCoordinates(tempArr);
              },0);
            }
          });
          }(i)
        );
  
      }
    });
  }
  if(!init){
    setInterval(() => {
      if($('#img-detected').height()>0){
        if(!init){
          setInit(true);
        }
      }
    }, 1000);
  }
}, [init])


useEffect(() => {
  for(var i = 0; i < 4; i ++){
    linedraw(coordinates,objectName,i)
  }
  
}, [coordinates])
  // useEffect(() => {
  //   // setTimeout(() => {
  //   //   $("#" + c.key?.replaceAll(" ", "")).resizable(
  //   //     (isDeletingObject || !zoomDisable) ? "disable" : "enable"
  //   //   );
  //   // })
  // }, [isDeletingObject, zoomDisable])
  const distoryObject = (c) => {
    handleObjectClick(c);
    $(`#${objectName}`).remove()
    $(`#${objectName}`).remove()
    $(`#${objectName}`).remove()
    $(`#${objectName}`).remove()
    $(`#${objectName}`).remove()
    $(`#${objectName}`).remove()
    $(`#${objectName}`).remove()
    $(`.line_${objectName}_0`).remove()
    $(`.line_${objectName}_1`).remove()
    $(`.line_${objectName}_2`).remove()
    $(`.line_${objectName}_3`).remove()
  }
  return (
    <div>
      {coordinates&&objectName&&<div
        id={c?.key?.replaceAll(" ", "")}
        className={"position-absolute object-box"}
        // onMouseDown={() => {!zoomDisable? setShowTooltip(true):setShowTooltip(false);}}
        // onMouseUp={() => setShowTooltip(false)}
        style={{
        //   top: coordinates[0].y + "px",
        //   left: coordinates[0].x + "px",
        //   width: coordinates[1].x - coordinates[0].x + "px",
        //   height: coordinates[3] - coordinates[1].y + "px",
        //   borderColor: `rgb(${c.color?.join(",")})`,
        //   border: '0px',
        // }}
        // style'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''={{
          top: coordinates[0]?.y + "px",
          left: coordinates[0]?.x + "px",
          width: coordinates[1]?.x - coordinates[0]?.x + "px",
          height: coordinates[2]?.y - coordinates[0]?.y + "px",
          border: `0px`,
        }} 
        //'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
        // coordinates={`${c.coordinates[0]},${c.coordinates[1]} ${c.coordinates[2]},${c.coordinates[1]} ${c.coordinates[2]},${c.coordinates[3]} ${c.coordinates[0]},${c.coordinates[3]}`}
      >
        <div className="position-relative">
          <div
            className="position-absolute object-box-key text-truncate"
            style={{
              backgroundColor: `rgb(${c?.color?.join(",")})`,
              // left: (coordinates[1]?.x - coordinates[0]?.x)/2 + "px"
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
            onClick={() => (!isDeletingObject ? distoryObject(c) : "")}
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
