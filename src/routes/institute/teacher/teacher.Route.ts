import express, { Router } from "express";
import Middleware from "../../../middleware/middleware";
import TeacherController from "../../../controller/institute/teacher/teacher.Controller";
import asyncErrorHandler from "../../../services/asyncErrorHandler";
import upload from "../../../middleware/multerUpload";
const routerTeacher: Router = express.Router();

// get and post method
routerTeacher
  .route("/")
  .post(
    Middleware.isLoggedIn,
    upload.single("teacherPhoto"),
    asyncErrorHandler(TeacherController.createTeacher)
  )
  .get(Middleware.isLoggedIn, asyncErrorHandler(TeacherController.getTeachers));

// ddete and patch method
routerTeacher
  .route("/:id")
  .delete(
    Middleware.isLoggedIn,
    asyncErrorHandler(TeacherController.deleteTeachers)
  )
  .get(
    Middleware.isLoggedIn,
    asyncErrorHandler(TeacherController.singleTeachers)
  )
  .patch(
    Middleware.isLoggedIn,
    asyncErrorHandler(TeacherController.updateTeachers)
  );

export default routerTeacher;
// wzog usmq tbeu sdnv
