import multer from "multer";
// this is how we are going the save a file inside the sever 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.filename + '-' + uniqueSuffix)// cb means call back function
    }
  })
  
  export const upload = multer({ storage: storage })