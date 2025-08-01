import express, { Request, Router } from "express";
import Middleware from "../../../middleware/middleware";
import StudentController from "../../../controller/institute/student/student.Controller";
import asyncErrorHandler from "../../../services/asyncErrorHandler";
const routerStudent: Router = express.Router();

import multer from "multer";
import { cloudinary, storage } from "../../../services/cloudinaryConfig";

const upload = multer({
  storage: storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image support garxaa hai!!!"));
    }
  },
  limits: {
    fileSize: 4 * 1024 * 1024, // 2 mb
  },
});

routerStudent
  .route("/")
  .get(Middleware.isLoggedIn, asyncErrorHandler(StudentController.getStudent))
  .post(
    Middleware.isLoggedIn,
    upload.single("studentImage"),
    asyncErrorHandler(StudentController.addStudent)
  );

routerStudent
  .route("/:id")
  .delete(
    Middleware.isLoggedIn,
    asyncErrorHandler(StudentController.deleteStudent)
  );

export default routerStudent;
