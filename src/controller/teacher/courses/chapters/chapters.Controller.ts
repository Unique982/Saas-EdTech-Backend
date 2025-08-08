import { QueryTypes } from "sequelize";
import sequelize from "../../../../database/connection";
import { IExtendedRequest } from "../../../../middleware/type";
import { Response } from "express";

class Chapter {
  static addChapter = async (req: IExtendedRequest, res: Response) => {
    const institueNumber = req.user?.currentInstituteNumber;
    const { courseId } = req.params;
    const { chapterName, chapterDuration, chapterLevel } = req.body;

    if (!chapterName || !chapterDuration || chapterLevel) {
      return res.status(400).json({ message: "All field are required" });
    }
    // course table id check garna
    const [course] = await sequelize.query(
      `SELECT * FROM course_${institueNumber} WHERE id = ?`,
      {
        replacements: [courseId],
        type: QueryTypes.SELECT,
      }
    );
    // check aayo ki nai
    if (!course) {
      return res.status(404).json({ message: "Course id not found!" });
    }
    // already create xa nai check
    const [courseChapterExists] = await sequelize.query(
      `SELECT * FROM course_chapter_${institueNumber} WHERE courseId = ? AND chapterName=? `,
      {
        replacements: [courseId, chapterName, courseId],
        type: QueryTypes.SELECT,
      }
    );
    if (courseChapterExists) {
      return res.status(400).json({
        message: "Already exist with that chapterName in that course",
      });
    }

    // insert
    await sequelize.query(
      `INSERT INTO course_chapter_${institueNumber}(chapterName,chapterDuration,chapterLevel,courseId)VALUES(?,?,?,?)`,
      {
        replacements: [chapterName, chapterDuration, chapterLevel, courseId],
        type: QueryTypes.INSERT,
      }
    );
    res.status(200).json({ message: "create chapter successfully!" });
  };
  // get  all chapter
  static fetchCourseChapter = async (req: IExtendedRequest, res: Response) => {
    const { courseId } = req.params;
    const institueNumber = req.user?.currentInstituteNumber;
    if (!courseId) {
      return res.status(400).json("Course id provide");
    }
    const [data] = await sequelize.query(
      `SELECT * FROM course_chapter_${institueNumber} WHERE courseId = ?`,
      {
        replacements: [courseId],
        type: QueryTypes.SELECT,
      }
    );
    if (data) {
      res.status(200).json({ message: "Chapter fetch", data });
    } else {
      res.status(404).json({ message: "chapter id not found" });
    }
  };

  // delete course chapter
  static deleteCourseChapter = async (req: IExtendedRequest, res: Response) => {
    const { courseId } = req.params;
    const instituteNumber = req.user?.currentInstituteNumber;
    const { chapterId } = req.params;
    if (!courseId) {
      return res.status(400).json({ message: "Plase course id provide!" });
    }
    const [data] = await sequelize.query(
      `SELECT * FROM course_chapter_${instituteNumber} WHERE id=?`,
      {
        replacements: [chapterId],
        type: QueryTypes.SELECT,
      }
    );
    await sequelize.query(
      `DELETE  FROM course_chapter_${instituteNumber} WHERE id =?`,
      {
        replacements: [chapterId],
        type: QueryTypes.DELETE,
      }
    );
    res.status(200).json({ message: "delete chapter successfully" });
  };
}

export default Chapter;
