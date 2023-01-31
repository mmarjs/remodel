export const mapPath = (path, newDimension, originalDimension) => {
  let rx = newDimension?.width / originalDimension?.width;
  let ry = newDimension?.height / originalDimension?.height;

  return path?.map((p) => {
    let temp = { ...p };
    temp.strokeWidth = temp.strokeWidth * rx;
    temp.paths = temp?.paths?.map((q) => {
      let tempQ = {};
      tempQ.x = Math.round(q?.x * rx);
      tempQ.y = Math.round(q?.y * ry);
      return tempQ;
    });
    return temp;
  });
};
