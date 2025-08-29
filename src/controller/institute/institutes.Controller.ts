import { NextFunction, Request, Response } from "express";
import sequelize from "../../database/connection";
import generateRandomNumber from "../../services/generateRandomNumber";
import { IExtendedRequest } from "../../middleware/type";
import User from "../../database/models/user.Model";
import categories from "../../database/seeder/categorySeed";

class InstituteController {
  static async createInstitute(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    const {
      instituteName,
      instituteEmail,
      institutePhoneNumber,
      instituteAddress,
    } = req.body;
    const institutePanNo = req.body.institutePanNo || null;
    const instituteVatNo = req.body.instituteVatNo || null;
    if (
      !instituteName ||
      !instituteEmail ||
      !institutePhoneNumber ||
      !instituteAddress
    ) {
      res.status(400).json({
        message:
          "Provide instituteName,instituteEmail,institutePhoneNo, instituteAddress",
      });
      return;
    }
    const instituteNumber = generateRandomNumber();
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS institute_${instituteNumber}(
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
       instituteName VARCHAR(255) NOT NULL,
       instituteEmail VARCHAR(255) NOT NULL UNIQUE,
       institutePhoneNumber VARCHAR(255) NOT NULL UNIQUE,
       instituteAddress VARCHAR(255) NOT NULL,
       institutePanNo VARCHAR(255),
       instituteVatNo VARCHAR(255),
       createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     
      )`
    );

    await sequelize.query(
      `INSERT INTO institute_${instituteNumber}(
      instituteName,instituteEmail,institutePhoneNumber,instituteAddress,institutePanNo, instituteVatNo
      )VALUES(?,?,?,?,?,?)`,
      {
        replacements: [
          instituteName,
          instituteEmail,
          institutePhoneNumber,
          instituteAddress,
          institutePanNo,
          instituteVatNo,
        ],
      }
    );
    // to create user_insitute hsitory table jha chai user le k k institue haru create garay ko xa
    await sequelize.query(`CREATE TABLE IF NOT EXISTS user_institute( id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId VARCHAR(255) REFERENCES users(id), instituteNumber INT UNIQUE)`);
    if (req.user) {
      await sequelize.query(
        `INSERT INTO user_institute(userId,instituteNumber) VALUES(?,?)`,
        {
          replacements: [req.user.id, instituteNumber],
        }
      );

      await User.update(
        {
          currentInstituteNumber: instituteNumber,
          role: "institute",
        },
        {
          where: {
            id: req.user.id,
          },
        }
      );
    }
    if (req.user) {
      req.user.currentInstituteNumber = instituteNumber;
    }

    next();
  }
  // create Teacher table

  static async createTeacherTable(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    const instituteNumber = req.user?.currentInstituteNumber;
    await sequelize.query(`CREATE TABLE IF NOT EXISTS teacher_${instituteNumber}(
   id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  teacherName VARCHAR(255) NOT NULL,
  teacherPhoneNumber VARCHAR (255), teacherEmail VARCHAR(255) NOT NULL, UNIQUE(teacherEmail), teacherExperience VARCHAR(255),teacherAddress VARCHAR(255), joinedDate DATE, salary VARCHAR(255),teacherPhoto VARCHAR(255),teacherPassword VARCHAR(255),teacherInstituteNumber VARCHAR(36) REFERENCES institute_${instituteNumber}(id),courseId VARCHAR(36) REFERENCES course_${instituteNumber}(id),createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
    next();
  }

  //  create student table
  static async createStudentTable(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    const institueNumber = req.user?.currentInstituteNumber;
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS student_${institueNumber}( id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),studentName VARCHAR(255) NOT NULL,studentEmail VARCHAR(255) NOT NULL UNIQUE, studentPhoneNumber VARCHAR(255) NOT NULL UNIQUE, studentAddress TEXT, enrolledDate DATE, studentImage VARCHAR(255), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`
    );
    next();
  }
  // create course table
  static async createCourseTable(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    const institueNumber = req.user?.currentInstituteNumber;
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS course_${institueNumber}( id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),courseName VARCHAR(255) NOT NULL, coursePrice VARCHAR(255) NOT NULL,
      courseDescription TEXT  ,courseDuration VARCHAR(255) NOT NULL, courseLevel ENUM('beginner','intermediate','advance')NOT NULL, courseThumbnail VARCHAR(244),teacherId VARCHAR(36) REFERENCES teacher_${institueNumber}(id),categoryId VARCHAR(36) NOT NULL REFERENCES category_${institueNumber}(id),createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`
    );
    res.status(200).json({
      message: "Institue create successfully vayo!",
      institueNumber,
    });
    next();
  }

  static async createChapterTable(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    const institueNumber = req?.user?.currentInstituteNumber;
    await sequelize.query(`CREATE TABLE IF NOT EXISTS course_chapter_${institueNumber}(id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),chapterName VARCHAR(100) NOT NULL, chapterDuration VARCHAR(100), chapterLevel ENUM('beginner','intermediate','advance')NOT NULL,courseId VARCHAR(36) NOT NULL REFERENCES course_${institueNumber}(id),createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
    next();
  }

  static createChapterLessonTable = async (
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS chapter_lesson_${instituteNumber}(id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),lessonName VARCHAR(100) NOT NULL, lessonDescription TEXT NOT NULL, lessonVideoURL VARCHAR(100),lessonThumbnailURL VARCHAR(100),chapterId VARCHAR(36) NOT NULL REFERENCES course_chapter_${instituteNumber}(id),createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`
    );
    next();
  };

  // category table
  static async createCategoryTable(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    const institueNumber = req.user?.currentInstituteNumber;
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS category_${institueNumber}( id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), categoryName VARCHAR(255) NOT NULL UNIQUE, categoryDescription TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP )`
    );
    categories.forEach(async function (category) {
      await sequelize.query(
        `INSERT INTO category_${institueNumber}(categoryName,categoryDescription) VALUES(?,?)`,
        {
          replacements: [category.categoryName, category.categoryDescription],
        }
      );
    });
    next();
  }
}
export default InstituteController;
