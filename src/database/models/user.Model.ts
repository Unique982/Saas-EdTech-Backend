import { Table, Column, Model, DataType } from "sequelize-typescript";
import { UserRole } from "../../middleware/type";

@Table({
  tableName: "users",
  modelName: "user",
  timestamps: true,
})
class User extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;
  @Column({
    type: DataType.STRING,
  })
  declare username: string;
  @Column({
    type: DataType.STRING,
  })
  declare email: string;
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  declare currentInstituteNumber: string;
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  declare password: string;
  @Column({
    type: DataType.ENUM("teacher", "institute", "super-admin", "student"),
    defaultValue: "student",
  })
  declare role: UserRole;
}
export default User;
