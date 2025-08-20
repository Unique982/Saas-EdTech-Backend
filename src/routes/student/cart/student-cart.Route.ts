import express, { Router } from "express";
import Middleware from "../../../middleware/middleware";
import asyncErrorHandler from "../../../services/asyncErrorHandler";
import StudentCart from "../../../controller/student/cart/student-cart.Controller";
import { UserRole } from "../../../middleware/type";

const studentCart: Router = express.Router();
studentCart
  .route("/cart")
  // post method
  .post(
    Middleware.isLoggedIn,
    Middleware.changeUserIdForTableName,
    Middleware.redrictTo(UserRole.Student),
    asyncErrorHandler(StudentCart.insertIntocartTableStudent)
  )
  // get method
  .get(
    Middleware.isLoggedIn,
    Middleware.changeUserIdForTableName,
    Middleware.redrictTo(UserRole.Student),
    asyncErrorHandler(StudentCart.fetchStudentCartItem)
  );
studentCart
  .route("/cart/:id")
  // delete method
  .delete(
    Middleware.isLoggedIn,
    Middleware.changeUserIdForTableName,
    Middleware.redrictTo(UserRole.Student),
    asyncErrorHandler(StudentCart.deleteStudentCartItem)
  );

export default studentCart;
