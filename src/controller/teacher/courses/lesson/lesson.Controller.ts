import sequelize from "../../../../database/connection";
import { IExtendedRequest } from "../../../../middleware/type";
import { Response } from "express";
import { QueryTypes } from "sequelize";

class Lessons {
  static createCourseLession = async (req: IExtendedRequest, res: Response) => {
    const institueNumber = req.user?.currentInstituteNumber;
    const {
      lessonName,
      lessonDescription,
      lessonThumbnailURL,
      lessonVideoURL,
      chapterId,
    } = req.body;
    if (
      !lessonName ||
      !lessonDescription ||
      !lessonThumbnailURL ||
      !lessonVideoURL ||
      !chapterId
    ) {
      return res.status(400).json({ message: "All fields required!" });
    }

    // insert query
    await sequelize.query(
      `INSERT INTO chapter_course_${institueNumber}(lessonName,lessonDescription,lessonThumbnailURL,lessonVideoURL,chapterId)VALUES(?,?,?,?,?)`,
      {
        replacements: [
          lessonName,
          lessonDescription,
          lessonThumbnailURL,
          lessonVideoURL,
          chapterId,
        ],
        type: QueryTypes.INSERT,
      }
    );
  };
}
export default Lessons;
