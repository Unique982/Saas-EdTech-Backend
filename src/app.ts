import express from "express";
const app = express();
// Gloable auth routes ho (login,registe,etc)
import authRouter from "./routes/globals/auth/auth.Route";
// institue ko related routers haru import garay ko ho
import instituteRouter from "./routes/institute/institute.Route";
import courseRouter from "./routes/institute/course/course.Route";
import routerCategory from "./routes/institute/category/category.Route";
import routerStudent from "./routes/institute/stundent/student.Route";
import routerTeacher from "./routes/institute/teacher/teacher.Route";

//teacher related router haru  import garay ko ho
import teacherRoute from "./routes/teacher/teacher.Route";
// yo chai middleware for parsing request ko lagai ho
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// auth api ho jun chai gloabal api ho
app.use("/api", authRouter);

// institute ko api
app.use("/api/institute", instituteRouter);
// institute ko cousre api jun chau institute la course management garxa
app.use("/api/institute/course", courseRouter);
// institute ko catgeory api jun chai institute la categeroy management garexan
app.use("/api/institute/category", routerCategory);
//inistitue ko Student router jun chai institute la student managment garxan
app.use("/api/institute/student", routerStudent);
// institue ko  teacher api jun chai institue la teacher management garxan
app.use("/api/institute/teacher", routerTeacher);

// aba chai teacher wala api haru
app.use("/api/teacher", teacherRoute);
export default app;
