import { QueryTypes } from "sequelize";
import sequelize from "../../../database/connection";
import User from "../../../database/models/user.Model";
import { IExtendedRequest } from "../../../middleware/type";
import { Response } from "express";
import { KhaltiPayment } from "./paymentIntegration";
enum PaymentMethod {
  COD = "cod",
  ESEWA = "esewa",
  KHALTI = "khalti",
}
class StudentOrder {
  static createStudentOrder = async (req: IExtendedRequest, res: Response) => {
    const userId = req.user?.id;
    const notChangeUserId = req.user?.id.split("-").join("-");
    const userData = await User.findByPk(userId);
    const { phoneNumber, remarks, PaymentMethod, amount } = req.body;
    const orderDetailsdData: {
      courseId: string;
      instituteId: string;
    }[] = req.body;
    if (orderDetailsdData.length === 0) {
      return res
        .status(400)
        .json({ messgae: "Please send the course you want to purchase!" });
    }
    if (!phoneNumber || !remarks) {
      return res
        .status(400)
        .json({ message: "Please Provide phoneNumber, remarks!" });
    }
    // student order table create
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS student_order_${userId}(id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), email VARCHAR(100)NOT NULL, phoneNumber VARCHAR(100) NOT NULL,remarks TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`
    );

    // craete payment table
    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_payment_${userId}(id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),paymentMethod ENUM('esewa','khalti','bank','cod'),
      paymentStatus ENUM('paid','unpaid','pending'),totalAmount VARCHAR(10) NOT NULL,orderId VARCHAR(10) NOT NULL,createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP )`);

    // insert query
    const data = await sequelize.query(
      `INSERT INTO student_order_${userId}(phoneNumber,email,remarks) VALUES(?,?,?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [phoneNumber, userData?.email, remarks],
      }
    );
    console.log(data);
    for (let orderDetail of orderDetailsdData) {
      await sequelize.query(
        `INSERT INTO student_order_deatils_${userId}(courseId,instituteId,orderId) VALUES(?,?,?)`,
        {
          type: QueryTypes.INSERT,
          replacements: [orderDetail.courseId, orderDetail.instituteId, 23],
        }
      );
    }
    // payment
    if (PaymentMethod === PaymentMethod.ESEWA) {
      // esewa
    } else if (PaymentMethod === PaymentMethod.KHALTI) {
      const response = await KhaltiPayment({
        amount: amount,
        return_url: "http://localhost:3000/",
        website_url: "http://localhost:3000/",
        purchase_order_id: orderDetailsdData[0].courseId,
        purchase_name: "Order_" + orderDetailsdData[0].courseId,
      });
      if (response.status === 200) {
        res.status(200).json({ message: "Takethis", data: response.data });
      } else {
        res.status(400).json({ message: "Something went wrong, try again!" });
      }
      // khalti
    } else if (PaymentMethod === PaymentMethod.COD) {
      // cash
    } else {
      // strip
    }
  };
}

export default StudentOrder;
