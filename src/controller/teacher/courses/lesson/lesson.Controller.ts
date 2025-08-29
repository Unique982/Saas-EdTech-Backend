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
      return res.status(400).json({ message: "Please provide all field!" });
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
    res.status(200).json({ message: "Lesson added to chapter" });
  };
  // fetch chapter lesson

  static fetchChapterLesson = async (req: IExtendedRequest, res: Response) => {
    const { chapterId } = req.params;
    const institueNumber = req.user?.currentInstituteNumber;
    if (!chapterId)
      return res.status(400).json({ message: "Please Provide chapterId" });
    const data = await sequelize.query(
      `SELECT * FROM chapter_lesson_${institueNumber} WHERE chapterId=?`,
      {
        type: QueryTypes.SELECT,
        replacements: [chapterId],
      }
    );
    res.status(200).json({ message: "leassons fetch", data });
  };
}
export default Lessons;
