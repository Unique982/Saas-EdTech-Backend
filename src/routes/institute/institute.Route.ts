import express, { Router } from "express";
import InstituteController from "../../controller/institute/institutes.Controller";
import Middleware from "../../middleware/middleware";
import asyncErrorHandler from "../../services/asyncErrorHandler";

const router: Router = express.Router();

router
  .route("/")
  .post(
    Middleware.isLoggedIn,
    asyncErrorHandler(InstituteController.createInstitute),
    asyncErrorHandler(InstituteController.createTeacherTable),
    asyncErrorHandler(InstituteController.createStudentTable),
    asyncErrorHandler(InstituteController.createCategoryTable),
    asyncErrorHandler(InstituteController.createChapterTable),
    asyncErrorHandler(InstituteController.createChapterLessonTable),
    asyncErrorHandler(InstituteController.createCourseTable)
  );

export default router;
