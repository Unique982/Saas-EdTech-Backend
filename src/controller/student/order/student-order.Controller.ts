import { QueryTypes } from "sequelize";
import sequelize from "../../../database/connection";
import User from "../../../database/models/user.Model";
import { IExtendedRequest } from "../../../middleware/type";
import { response, Response } from "express";
import { KhaltiPayment } from "./paymentIntegration";
import axios from "axios";
import { generateKey } from "crypto";
import generateSha256Hash from "../../../services/generateSha256";
import base64 from "base-64";

enum paymentMethod {
  COD = "cod",
  ESEWA = "esewa",
  KHALTI = "khalti",
}
enum VerifcationStatus {
  Completed = "Completed",
}
class StudentOrder {
  static createStudentOrder = async (req: IExtendedRequest, res: Response) => {
    const userId = req.user?.id;
    const notChangeUserId = req.user?.id.split("_").join("-");
    const userData = await User.findByPk(notChangeUserId);
    const { phoneNumber, remarks, paymentMethod, amount } = req.body;
    const orderDetailsData: {
      courseId: string;
      instituteId: string;
    }[] = req.body.orderDetails;
    if (orderDetailsData.length === 0) {
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
    // order deatils table
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS student_order_details_${userId}(id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),courseId VARCHAR(36),instituteId VARCHAR(36),orderId VARCHAR(36),createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`
    );

    // craete payment table
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS student_payment_${userId}(id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),paymentMethod ENUM('esewa','khalti','bank','cod'),pidx VARCHAR(36),paymentStatus ENUM('paid','unpaid','pending')DEFAULT('pending'),totalAmount VARCHAR(10) NOT NULL,orderId VARCHAR(10) NOT NULL,createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP )`
    );
    console.log(userData, "userData");
    // insert query
    const data = await sequelize.query(
      `INSERT INTO student_order_${userId}(phoneNumber,email,remarks) VALUES(?,?,?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [phoneNumber, userData?.email, remarks],
      }
    );
    const [result]: { id: { id: string } }[] = await sequelize.query(
      `SELECT id FROM student_order_${userId} WHERE phoneNumber =? AND remarks=?`,
      { type: QueryTypes.SELECT, replacements: [phoneNumber, remarks] }
    );

    console.log(result.id, "Result");
    for (let orderDetail of orderDetailsData) {
      await sequelize.query(
        `INSERT INTO student_order_details_${userId}(courseId,instituteId,results) VALUES(?,?,?)`,
        {
          type: QueryTypes.INSERT,
          replacements: [
            orderDetail.courseId,
            orderDetail.instituteId,
            result.id,
          ],
        }
      );
    }
    let pidx;
    // payment
    if (paymentMethod === paymentMethod.ESEWA) {
      // esewa

      const { amount } = req.body;
      const paymentData = {
        tax_amount: "0",
        product_service_charge: "0",
        product_delivery_charge: "0",
        product_code: process.env.ESEWA_PRODUCT_CODE,
        total_amount: amount,
        transaction_uuid: orderDetailsData[0].courseId,
        success_url: "http://localhost:3000/",
        failure_url: "http://localhost:3000/failure",
        signed_field_names: "total_amount,transaction_uuid,product_code",
      };
      const data = `total_amount=${paymentData.total_amount}.transaction-uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}
      
      `;
      const esewaSecretKey = process.env.ESEWA_SECRET_KEY;
      const signature = generateSha256Hash(data, esewaSecretKey as string);
      console.log(paymentData, "PaymentData");
      const response = await axios.post(
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        {
          ...paymentData,
          signature,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencode",
          },
        }
      );
      console.log(response.request.res.responseUrl, "this is response");
      if (response.status === 200) {
        await sequelize.query(
          `INSERT INTO student_payment_${userId}(paymentMethod,totalAmount,orderId,transaction_uuid)VALUES(?,?,?,?)`,
          {
            type: QueryTypes.INSERT,
            replacements: [
              paymentMethod,
              amount,
              result.id,
              paymentData.transaction_uuid,
            ],
          }
        );
        res.status(200).json({
          message: "Payment initiated",
          data: response.request.res.responseUrl,
        });
      }

      // const signature = generateKey(data.esewaSecretKey as string);
    } else if (paymentMethod === paymentMethod.KHALTI) {
      const response = await KhaltiPayment({
        amount: amount,
        return_url: "http://localhost:3000/",
        website_url: "http://localhost:3000/",
        purchase_order_id: orderDetailsData[0].courseId,
        purchase_name: "Order_" + orderDetailsData[0].courseId,
      });
      if (response.status === 200) {
        pidx = response.data.pidx;
        res.status(200).json({ message: "Takethis", data: response.data.pidx });
      } else {
        res.status(400).json({ message: "Something went wrong, try again!" });
      }
      // khalti
    } else if (paymentMethod === paymentMethod.COD) {
    } else {
      // strip
    }
    await sequelize.query(
      `INSERT INTO student_payment_${userId}(paymentMethod,totalAmount,orderId,pidx) VALUES(?,?,?,?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [paymentMethod, amount, result.id, pidx],
      }
    );
  };
  // khalti
  static studentCoursePaymentVerficiation = async (
    req: IExtendedRequest,
    res: Response
  ) => {
    const { pidx } = req.body;
    const userId = req.user?.id;
    if (!pidx) return res.status(400).json({ message: "Please Provide all" });
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup",
      { pidx },
      {
        headers: {
          Authorization: "Key b68b4f0f4aa84599ad9b91c475ed6833",
        },
      }
    );
    const data = response.data;
    if (data.status === VerifcationStatus.Completed) {
      await sequelize.query(
        `UPDATE student_payment_${userId} SET paymentStatus = ? WHERE pidx =?`,
        {
          type: QueryTypes.UPDATE,
          replacements: ["paid", pidx],
        }
      );
      res.status(200).json({ message: "Paymemnt verified successfully" });
    } else {
      res.status(500).json({ message: "Payment not varified!" });
    }
  };

  // sewa
  static studentCourseEsewaPaymentVerification = async (
    req: IExtendedRequest,
    res: Response
  ) => {
    const { encodedData } = req.body;
    const userId = req.user?.id;
    if (!encodedData)
      return res
        .status(400)
        .json({ message: "Please provide data base64 for verification" });

    const result = base64.decode(encodedData);
    const newresult: {
      total_amount: string;
      transaction_uuid: string;
    } = JSON.parse(result);
    const response = await axios.get(
      `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${newresult.total_amount}&transaction_uuid=${newresult.transaction_uuid}`
    );
    if (response.status === 200 && response.data.static === "COMPLETE") {
      await sequelize.query(
        `UPDATE student_payment_${userId} SET paymentStatus=? WHERE transaction_uuid=?`,
        {
          type: QueryTypes.UPDATE,
          replacements: ["paid", newresult.transaction_uuid],
        }
      ),
        res.status(200).json({ message: "Payment verified successfully" });
    } else {
      res.status(500).json({ message: "not verified" });
    }
  };
}
export default StudentOrder;
