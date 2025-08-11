import express, { Router } from "express";
const router: Router = express.Router();
import StudentInstitute from "../../../controller/student/institute/student-institute.Controller";
import asyncErrorHandler from "../../../services/asyncErrorHandler";

router
  .route("/institute")
  .get(asyncErrorHandler(StudentInstitute.listInstitute));

router
  .route("/institute/:instituteId/course")
  .get(asyncErrorHandler(StudentInstitute.getInstituteCourseList));

export default router;
