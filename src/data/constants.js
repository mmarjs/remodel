module.exports.Constants = {
  base64Start: "data:image/png;base64,",
  coordinates: [
    { key: "couch", coordinates: [211, 243, 470, 323] },
    { key: "clock", coordinates: [420, 180, 460, 220] },
    { key: "chair", coordinates: [64, 244, 113, 311] },
    { key: "clock001", coordinates: [94, 145, 117, 159] },
    { key: "couch001", coordinates: [113, 270, 283, 434] },
    { key: "clock002", coordinates: [132, 145, 145, 158] },
    { key: "chair001", coordinates: [117, 243, 159, 281] },
    { key: "clock003", coordinates: [76, 145, 89, 157] },
    { key: "cup", coordinates: [374, 275, 388, 290] },
    { key: "dining table", coordinates: [73, 244, 184, 285] },
    { key: "vase", coordinates: [516, 254, 529, 282] },
  ],
  sampleImages: [
    {
      name: "room1",
      originalUrl: "room1.png",
      thumbnailUrl: "room1_tn.jpg",
    },
    {
      name: "room2",
      originalUrl: "room2.png",
      thumbnailUrl: "room2_tn.jpg",
    },
    {
      name: "room3",
      originalUrl: "room3.png",
      thumbnailUrl: "room3_tn.jpg",
    },
    {
      name: "room4",
      originalUrl: "room4.png",
      thumbnailUrl: "room4_tn.jpg",
    },
    {
      name: "room5",
      originalUrl: "room5.png",
      thumbnailUrl: "room5_tn.jpg",
    },
  ],
  ERRORS: {
    CANCELED_ERROR: {
      name: "Canceled Error",
      code: "ERR_CANCELED",
    },
    UNEXPECTED_ERROR: {
      name: "Unexpected Error",
      message: "An unexpected error has occured!",
    },
  },
  screenDimensions: {
    xsm: {
      screenWidth: 1368,
      width: 650,
      height: 250,
    },
    sm: {
      screenWidth: 1368,
      width: 950,
      height: 550,
    },
    md: {
      screenWidth: 1440,
      width: 1200,
      height: 760,
    },
    lg: {
      screenWidth: 1680,
      width: 850,
      height: 650,
    },
    xl: {
      screenWidth: 1800,
      width: 1200,
      height: 820,
    },
  },
  screenDimensions2: {
    xsm: {
      screenWidth: 1368,
      width: 700,
      height: 300,
    },
    sm: {
      screenWidth: 1368,
      width: 950,
      height: 550,
    },
    md: {
      screenWidth: 1440,
      width: 1200,
      height: 760,
    },
    lg: {
      screenWidth: 1680,
      width: 850,
      height: 650,
    },
    xl: {
      screenWidth: 1800,
      width: 1200,
      height: 820,
    },
  },

  allowedTypes: ["image/webp", "image/png", "image/jpg", "image/jpeg"]
};
