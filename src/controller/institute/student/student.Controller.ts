import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";

class Studentcontroller {
  static getStudent = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;

    const students = await sequelize.query(
      `SELECT * FROM student_${instituteNumber}`,
      {
        type: QueryTypes.SELECT,
      }
    );
    res
      .status(200)
      .json({ message: "Student fetech successfully", data: students });
  };

  // add student

  static addStudent = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const {
      studentName,
      studentEmail,
      studentPhoneNumber,
      studentAddress,
      enrolledDate,
    } = req.body;
    const studentImage = req.file ? req.file.path : null;
    if (
      !studentName ||
      !studentEmail ||
      !studentPhoneNumber ||
      !studentAddress ||
      !enrolledDate
    ) {
      res.status(400).json({ message: "All feild  are require " });
    }

    await sequelize.query(
      `INSERT INTO student_${instituteNumber}(studentName,studentEmail,studentPhoneNumber,studentAddress,enrolledDate,studentImage)VALUES(?,?,?,?,?,?)`,
      {
        replacements: [
          studentName,
          studentEmail,
          studentPhoneNumber,
          studentAddress,
          enrolledDate,
          studentImage || "image.png",
        ],
      }
    );
    res.status(200).json({ message: "student add successfully!" });
  };

  // delete student
  static deleteStudent = async (req: IExtendedRequest, res: Response) => {};
}
export default Studentcontroller;
