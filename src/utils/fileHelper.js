const multer = require('multer');
const path = require('path');

// Define the absolute paths for the visitor and employee image folders
const employeeFolderPath = path.resolve(__dirname, '../../public/images/Employee');
const visitorFolderPath = path.resolve(__dirname, '../../public/images/visitor');

const employeeImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save employee images to the Employee folder
    cb(null, employeeFolderPath);
  },
  filename: (req, file, cb) => {
    const { EmpNo } = req.body;
    if (!EmpNo) {
      return cb(new Error('EmpNo is required'));
    }
    const extname = path.extname(file.originalname);
    cb(null, `${EmpNo}${extname}`);
  }
});

const visitorImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save visitor images to the visitor folder
    cb(null, visitorFolderPath);
  },
  filename: (req, file, cb) => {
    const { MobileNo } = req.body;
    console.log("Request Body in filename function:", req.body); // Add console log here
    if (!MobileNo) {
      return cb(new Error('MobileNo is required'));
    }
    const extname = path.extname(file.originalname);
    cb(null, `${MobileNo}${extname}`);
  }
});

function fileFilter(req, file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = {
  employeeImgStorage,
  visitorImgStorage,
  fileFilter
};
