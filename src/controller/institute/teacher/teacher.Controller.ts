import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import generatedRandomPassword from "../../../services/generateRandomPassword";

import { QueryTypes } from "sequelize";
import sendMail from "../../../services/sendEmail";
import User from "../../../database/models/user.Model";

class TeacherController {
  static createTeacher = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;

    const {
      teacherName,
      teacherPhoneNumber,
      teacherEmail,
      teacherAddress,
      teacherExperience,
      salary,
      joinedDate,
      courseId,
    } = req.body;

    if (
      !teacherName ||
      !teacherPhoneNumber ||
      !teacherEmail ||
      !teacherAddress ||
      !teacherExperience ||
      !salary ||
      !joinedDate
    ) {
      return res.status(400).json({ message: "All filed is require" });
    }
    const teacherPhoto = req.file ? req.file.path : "https://uniqe.png";
    // password generatad function
    const data = generatedRandomPassword(teacherName);
    await sequelize.query(
      `INSERT INTO teacher_${instituteNumber}(teacherName,teacherPhoneNumber,teacherEmail,teacherExperience,teacherAddress,salary,joinedDate,teacherPhoto,teacherPassword,	teacherInstituteNumber,courseId) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [
          teacherName,
          teacherPhoneNumber,
          teacherEmail,
          teacherExperience,
          teacherAddress,
          salary,
          joinedDate,
          teacherPhoto,
          data.hashedVersion,
          instituteNumber,
          courseId,
        ],
      }
    );

    const teacherData: { id: string }[] = await sequelize.query(
      `SELECT id FROM teacher_${instituteNumber} WHERE teacherEmail = ?`,
      {
        type: QueryTypes.SELECT,
        replacements: [teacherEmail],
      }
    );
    console.log(teacherData, "teacherData");
    await sequelize.query(
      `UPDATE course_${instituteNumber} SET teacherId=? WHERE id=?`,
      {
        type: QueryTypes.UPDATE,
        replacements: [teacherData[0].id, courseId],
      }
    );
    // sent email
    const mailInformation = {
      to: teacherEmail,

      subject: "Welcom to teacher our saas project2!",
      text: `<div class="bg-gray-100 py-10">
  <div class="max-w-xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-blue-600 text-white px-6 py-4">
      <h1 class="text-xl font-bold">Welcome to Our Institute</h1>
    </div>

    <!-- Body -->
    <div class="px-6 py-4 text-gray-800">
      <p class="text-base mb-4">
        Hello <strong>${teacherName}</strong>,
      </p>

      <p class="mb-4">
        We are pleased to inform you that you have been successfully registered as a new teacher at our institute.
        Below are your login details:
      </p>

      <ul class="mb-4 text-sm list-disc pl-5 space-y-1">
        <li><strong>Email:</strong> ${teacherEmail}</li>
        <li><strong>Password:</strong> ${data.planVersion}</li>
        <li><strong>Institute Number:</strong> ${instituteNumber}</li>
      </ul>

      <!-- Login Button -->
      <div class="text-center mt-6">
        <a
          href="http://your-login-url.com"
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition duration-300"
          target="_blank"
        >
          Login Now
        </a>
      </div>

      <p class="mt-6 mb-4 text-sm">
        If you have any questions, feel free to contact us.
      </p>

      <p class="text-sm text-gray-500">
        This is an automated email. Please do not reply.
      </p>
    </div>

    <!-- Footer -->
    <div class="bg-gray-100 px-6 py-4 text-center text-sm text-gray-600">
      &copy; 2025 Unique Institute Solution. All rights reserved.
    </div>
  </div>
</div>

      `,
    };
    await sendMail(mailInformation);
    res.status(200).json({ message: "Teacher added successfully!" });
  };

  // get teacher
  static getTeachers = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const [teachers] = await sequelize.query(
      `SELECT t.*, c.courseName FROM teacher_${instituteNumber} AS t LEFT JOIN course_${instituteNumber} AS c ON t.courseId = c.id`
    );

    res.status(200).json({ message: "teahers fetch", data: teachers });
  };

  // delete teacher
  static deleteTeachers = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const id = req.params.id;
    await sequelize.query(
      `DELETE FROM teacher_${instituteNumber} WHERE id =?`,
      {
        type: QueryTypes.DELETE,
        replacements: [id],
      }
    );
    res.status(200).json({ message: "Delete teacher successfully" });
  };

  static singleTeachers = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const id = req.params.id;
    const teachers = await sequelize.query(
      `SELECT * FROM teacher_${instituteNumber} WHERE id=?`,
      {
        type: QueryTypes.SELECT,
        replacements: [id],
      }
    );
    res
      .status(200)
      .json({ message: "single teacher fetch successfully", data: teachers });
  };

  // update teacher record
  static updateTeachers = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const id = req.params.id;
    const {
      teacherName,
      teacherPhoneNumber,
      teacherEmail,
      teacherExperience,
      teacherAddress,
      salary,
      joinedDate,
      courseId,
    } = req.body;

    if (
      !teacherName ||
      !teacherPhoneNumber ||
      !teacherEmail ||
      !teacherExperience ||
      !teacherAddress ||
      !salary ||
      !joinedDate
    ) {
      return res.status(400).json({ message: "All filed is require" });
    }
    const teacherPhoto = req.file ? req.file.path : "https://uniqe.png";
    // password generatad function
    await sequelize.query(
      `UPDATE teacher_${instituteNumber} SET teacherName=?,teacherPhoneNumber=?,teacherEmail=?,teacherExperties=?,teacherAddress=?,salary=?,joinedDate=?,teacherPhoto=?,courseId=? WHERE id =?`,
      {
        type: QueryTypes.UPDATE,
        replacements: [
          teacherName,
          teacherPhoneNumber,
          teacherEmail,
          teacherExperience,
          teacherAddress,
          salary,
          joinedDate,
          teacherPhoto,
          courseId,
        ],
      }
    );
    res.status(200).json({ message: "teacher update successfully!" });
  };
}
export default TeacherController;
