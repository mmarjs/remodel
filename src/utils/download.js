export const download = async (name,data) => {
    const link = document.createElement("a");
    // create a blobURI pointing to our Blob
    link.href = URL.createObjectURL(data);
    link.download = name;
    // some browser needs the anchor to be in the doc
    document.body.append(link);
    link.click();
    link.remove();
    // in case the Blob uses a lot of memory
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);
  // let img = new Image();
  // img.id = 'downloadImg'
  //   img.onload = async function () {
  //     let link;
  //     try {        
  //       document.body.appendChild(img);
  //       const canvas = await html2canvas(img);
  //       document.body.removeChild(img);
  //       const data = canvas.toDataURL("image/jpeg", 1);
  //        link = document.createElement("a");
  //       let ext = data.slice(data.indexOf("/") + 1, data.indexOf(";"));
  //       link.href = data;
  //       link.download = (name || 'Touchupp') + "." + ext;
  //       link.click();
  //     } catch (ex) {
  //          document.body.removeChild(img);
  //     }
  //   };
  //   let blob = data;
  //   // let blob = URL.createObjectURL(data);
  //   img.src = img.src = URL.createObjectURL(data);;
};
