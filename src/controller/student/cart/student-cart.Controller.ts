import sequelize from "../../../database/connection";
import { IExtendedRequest } from "../../../middleware/type";
import { Response } from "express";
import { QueryTypes } from "sequelize";
class StudentCart {
  static insertIntocartTableStudent = async (
    req: IExtendedRequest,
    res: Response
  ) => {
    const userId = req.user?.id;
    const { instituteId, courseId } = req.body;
    if (!instituteId || !courseId) {
      return res
        .status(400)
        .json({ message: "Please provide instituteId and courseId" });
    }

    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS student_cart_${userId}(id VARCHAR PRIMARY KEY DEFAULT (UUID()),courseId VARCHAR(36) REFERENCES course_${instituteId}(id), institute VARCHAR(36) REFERENCES institute_${instituteId}(id),
      userId VARCHAR(36) REFERENCES users(id),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`
    );

    // insert query
    await sequelize.query(
      `INSERT INTO student_cart_${userId}(courseId,instituteId,userId) VALUES(?,?,?)`,
      {
        replacements: [courseId, instituteId, userId],
        type: QueryTypes.INSERT,
      }
    );
    res.status(200).json({ message: "Course added to cart" });
  };
  // fecth
  static fetchStudentCartItem = async (
    req: IExtendedRequest,
    res: Response
  ) => {
    const userId = req.user?.id;
    let cartDatas = [];

    const datas: { instituteId: string; courseId: string }[] =
      await sequelize.query(
        `SELECT * FROM student_cart_${userId} WHERE userId=?`,
        {
          type: QueryTypes.SELECT,
          replacements: [userId],
        }
      );
    for (let data of datas) {
      const test = await sequelize.query(
        `SELECT * FROM course_${data.instituteId}JOIN category_${data.instituteId} ON course_${data.instituteId}.categoryid =category_${data.instituteId}.id WHERE id = '${data.instituteId}'`,
        {
          type: QueryTypes.SELECT,
        }
      );
      cartDatas.push(...test);
    }
    res.status(200).json({ message: "cart fetch", data: cartDatas });
  };

  // delete
  static deleteStudentCartItem = async (
    req: IExtendedRequest,
    res: Response
  ) => {
    const userId = req.user?.id;
    const cartTableId = req.params.cartTableId;
    if (!cartTableId) {
      return res.status(404).json({ message: "Please provide cart table id!" });
    }
    await sequelize.query(
      `DELETE FROM student_cart_${userId} WHERE cartTableId = ?`,
      {
        type: QueryTypes.DELETE,
        replacements: [cartTableId],
      }
    );
    res.status(200).json({ message: "Delete Successfully!" });
  };
}
export default StudentCart;
