import express from "express";
const app = express();
import cors from "cors";
// Gloable auth routes ho (login,registe,etc)
import authRouter from "./routes/globals/auth/auth.Route";
// institue ko related routers haru import garay ko ho
import instituteRouter from "./routes/institute/institute.Route";
import courseRouter from "./routes/institute/course/course.Route";
import routerCategory from "./routes/institute/category/category.Route";
import routerStudent from "./routes/institute/stundent/student.Route";
import routerTeacher from "./routes/institute/teacher/teacher.Route";

// yo chai middleware for parsing request ko lagai ho
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// cors config
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// auth api ho jun chai gloabal api ho
app.use("/api/auth", authRouter);
//teacher related router haru  import garay ko ho
import teacherRoute from "./routes/teacher/teacher.Route";
import chapterRoute from "./routes/teacher/course/chapter/course-chapter.Route";
import lessonsRoute from "./routes/teacher/course/lesson/course-lesson.Route";

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
app.use("/api/teacher/login", teacherRoute);

// teacher la add garna course ko chapter
app.use("/api/teacher/course", chapterRoute);
// teacher la chapter ma lesson add
app.use("/app/teacher/course", lessonsRoute);
export default app;
