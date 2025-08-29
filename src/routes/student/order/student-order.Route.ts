import express, { Router } from "express";
import Middleware from "../../../middleware/middleware";
import asyncErrorHandler from "../../../services/asyncErrorHandler";
import StudentOrder from "../../../controller/student/order/student-order.Controller";
import { UserRole } from "../../../middleware/type";
const router: Router = express.Router();

router.route("/order").post(
  Middleware.isLoggedIn, // check if the user logge in or not
  Middleware.changeUserIdForTableName, // modifies the table name using the user ko id bat
  Middleware.restrictTo(UserRole.Student), // allow access only if the user role :  student
  asyncErrorHandler(StudentOrder.createStudentOrder) // runs the controller, wrapped in async error handler
);

// order verifytransaction
router
  .route("/order/khalti/verify-transaction")
  .post(
    Middleware.isLoggedIn,
    Middleware.changeUserIdForTableName,
    Middleware.restrictTo(UserRole.Student),
    asyncErrorHandler(StudentOrder.studentCoursePaymentVerficiation)
  );
router
  .route("/order/esewa/verify-transaction")
  .post(
    Middleware.isLoggedIn,
    Middleware.changeUserIdForTableName,
    Middleware.restrictTo(UserRole.Student),
    asyncErrorHandler(StudentOrder.studentCourseEsewaPaymentVerification)
  );

export default router;
