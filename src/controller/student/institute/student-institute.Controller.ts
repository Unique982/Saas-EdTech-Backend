import { QueryTypes } from "sequelize";
import sequelize from "../../../database/connection";
import { Request, response, Response } from "express";

class StudentInstitute {
  static listInstitute = async (req: Request, res: Response) => {
    const tables = await sequelize.query(`SHOW TABLES LIKE 'institute_%'`, {
      type: QueryTypes.SHOWTABLES,
    });
    let allDatas = [];
    for (let table of tables) {
      console.log(table);

      const instituteNumber = table.split("_")[1];
      const [data] = await sequelize.query(
        `SELECT instituteName,institutePhoneNumber FROM ${table}`,
        {
          type: QueryTypes.SELECT,
        }
      );
      allDatas.push({ instituteNumber: instituteNumber, ...data });
    }

    res.status(200).json({ message: "data fetch", data: allDatas });
  };

  // get institute all course list
  static getInstituteCourseList = async (req: Request, res: Response) => {
    const { instituteId } = req.params;
    const data = await sequelize.query(
      `SELECT * FROM course_${instituteId} JOIN category_${instituteId} ON course_${instituteId}.categoryId = category_${instituteId}.id`,
      {
        type: QueryTypes.SELECT,
      }
    );
    if (data.length == 0) {
      return res
        .status(404)
        .json({ message: "No course found this institute!" });
    }
    res.status(200).json({ message: "course fetch", data: data });
  };
}

export default StudentInstitute;
