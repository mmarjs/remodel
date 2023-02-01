export const download = async (name, data) => {
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
};
