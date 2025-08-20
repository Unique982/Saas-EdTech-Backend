import { Request, Response } from "express";
import sequelize from "../../database/connection";
import { QueryTypes } from "sequelize";
import bcrypt from "bcrypt";
import generaterJWTToken from "../../services/generateJWTToken";

// inteface ho
interface ITeacherData {
  id: string;
  teacherPassword: string;
}
class LoginSystem {
  static teacherLogin = async (req: Request, res: Response) => {
    const { teacherEmail, teacherPassword, teacherInstituteNumber } = req.body;
    // data aaya xa ki nai check garnu paro
    if (!teacherEmail || !teacherPassword || !teacherInstituteNumber) {
      return res.status(400).json({ message: "Plase provide all" });
    }
    const teacherData: ITeacherData[] = await sequelize.query(
      `SELECT * FROM teacher_${teacherInstituteNumber} WHERE teacherEmail =?`,
      {
        type: QueryTypes.SELECT,
        replacements: [teacherEmail],
      }
    );
    // teacher exits xa ki naiu check garan
    if (teacherData.length == 0) {
      return res.status(404).json({ message: "Invalid Credentails" });
    }

    // teacherPassword match grana
    const isPasswordMateched = bcrypt.compareSync(
      teacherPassword,
      teacherData[0].teacherPassword
    );
    if (!isPasswordMateched) {
      res.status(400).json({ message: "invalid Credentails" });
    } else {
      // token generation
      const token = generaterJWTToken({
        id: teacherData[0].id,
        institueNumber: teacherInstituteNumber,
      });
      res.status(200).json({
        message: "Teacher login successfully!",
        data: {
          teacherToken: token,
          teacherInstituteNumber,
          teacherEmail,
        },
      });
    }
  };
}
export default LoginSystem;
