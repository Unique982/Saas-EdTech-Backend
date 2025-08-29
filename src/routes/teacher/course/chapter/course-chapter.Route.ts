import express, { Router } from "express";
const chapterRoute: Router = express.Router();
import Middleware from "../../../../middleware/middleware";
import asyncErrorHandler from "../../../../services/asyncErrorHandler";
import Chapter from "../../../../controller/teacher/courses/chapters/chapters.Controller";
import { UserRole } from "../../../../middleware/type";
chapterRoute
  // post and all fetch
  .route("/:courseId/chapter/")
  .post(
    Middleware.isLoggedIn,
    Middleware.restrictTo(UserRole.Teacher),
    asyncErrorHandler(Chapter.addChapter)
  )
  .get(
    Middleware.isLoggedIn,
    Middleware.restrictTo(UserRole.Teacher),
    asyncErrorHandler(Chapter.fetchCourseChapter)
  );

// delete/single/edit
chapterRoute
  .route("/:courseId/chapter/:id/")
  .delete(
    Middleware.isLoggedIn,
    Middleware.restrictTo(UserRole.Teacher),
    asyncErrorHandler(Chapter.deleteCourseChapter)
  );

export default chapterRoute;
