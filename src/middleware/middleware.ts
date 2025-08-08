import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../database/models/user.Model";
import { IExtendedRequest, UserRole } from "./type";

class Middleware {
  static async isLoggedIn(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // check if login or not
    // token accept
    // verify garne
    try {
      const token = req.headers.authorization;

      if (!token) {
        res.status(401).json({
          message: "Please provide token",
        });
        return;
      }
      //verfiy token
      jwt.verify(token, "token", async (erroraayo, resultaayo: any) => {
        if (erroraayo) {
          res.status(403).json({ message: "Token invalid vayo" });
        } else {
          const userData = await User.findByPk(resultaayo.id, {
            attributes: ["id", "currentInstituteNumber", "role"],
          });

          if (!userData) {
            res
              .status(403)
              .json({ message: "No user with that id, invalid token" });
          } else {
            req.user = userData;
            next();
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  static redrictTo = (...role: UserRole[]) => {
    // array form ma data basxa ["teacher","student","institute"]
    return (req: IExtendedRequest, res: Response, next: NextFunction) => {
      // requesting user ko role k xa tyoe liney ani parameter ma pass garna
      let UserRole = req.user?.role as UserRole;
      if (role.includes(UserRole)) {
        // filter gray ko ho include ma la chai array ma tyo data xa ki nai vana rw check garxa
        next();
      } else {
        res
          .status(403)
          .json({ message: "invalid, you dont have acces tothis" });
      }
    };
  };
}
export default Middleware;
