import { Request, Response, NextFunction } from "express";
import sequelize from "../../../database/connection";
import { IExtendedRequest } from "../../../middleware/type";

class CourseController {
  // add course
  static async createCourse(req: IExtendedRequest, res: Response) {
    const instituteNumber = req.user?.currentInstituteNumber;

    const {
      courseName,
      coursePrice,
      courseDescription,
      courseDuration,
      courseLevel,
    } = req.body;
    if (
      !courseName ||
      !coursePrice ||
      !courseDescription ||
      !courseDuration ||
      !courseLevel
    ) {
      return res.status(400).json({ message: "Please Provide all field " });
    }
    // const courseThumbnail = null;
    const courseThumbnail = req.file ? req.file.path : null;
    const returnedData = await sequelize.query(
      `INSERT INTO course_${instituteNumber}(courseName,coursePrice,courseDescription, courseDuration, courseLevel,courseThumbnail) VALUES(?,?,?,?,?,?)`,
      {
        replacements: [
          courseName,
          coursePrice,
          courseDescription,
          courseDuration,
          courseLevel,
          courseThumbnail,
          // coursePhoto || "https://uniqueneupane.com/image/hello.png",
        ],
      }
    );
    console.log(returnedData);
    res.status(200).json({ message: "create course successfully" });
  }

  /// get all courses
  static async getAllCourse(req: IExtendedRequest, res: Response) {
    const instituteNumber = req.user?.currentInstituteNumber;
    console.log(instituteNumber, "k xa ala ko current");
    const [courses] = await sequelize.query(
      `SELECT * FROM course_${instituteNumber}`
    );
    res
      .status(200)
      .json({ message: " all course fetech sucessfully", data: courses });
  }

  /// delete cousre
  static async deleteCoures(req: IExtendedRequest, res: Response) {
    const instituteNumber = req.user?.currentInstituteNumber;
    const courseId = req.params.id;

    // fisrt chech if course exits or not if exists and
    const [ccoursData] = await sequelize.query(
      `SELECT * FROM course_${instituteNumber} WHERE id = ?`,
      { replacements: [courseId] }
    );
    if (ccoursData.length == 0) {
      return res.status(404).json({ message: "no course with that id" });
    }
    await sequelize.query(`DELETE FROM course_${instituteNumber} WHERE id= ?`, {
      replacements: [courseId],
    });
    res.status(200).json({ message: "course delete successfully" });
  }

  // get single course fetch
  static async getSingleCourse(req: IExtendedRequest, res: Response) {
    const instituteNumber = req.user?.currentInstituteNumber;
    const courseId = req.params.id;
    const course = await sequelize.query(
      `SELECT * FROM course_${instituteNumber} WHERE id = ?`,
      {
        replacements: [courseId],
      }
    );
    res
      .status(200)
      .json({ message: "single course fetch successfully", data: course });
  }
}

export default CourseController;
