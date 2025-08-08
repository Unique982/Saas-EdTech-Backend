import express, { Router } from "express";
import Lessons from "../../../../controller/teacher/courses/lesson/lesson.Controller";
import Middleware from "../../../../middleware/middleware";
const lessonsRoute: Router = express.Router();
import { UserRole } from "../../../../middleware/type";
import asyncErrorHandler from "../../../../services/asyncErrorHandler";

lessonsRoute
  .route("/:chapterId/lesson/")
  .post(
    Middleware.isLoggedIn,
    Middleware.redrictTo(UserRole.Teacher),
    asyncErrorHandler(Lessons.createCourseLession)
  );
export default lessonsRoute;
