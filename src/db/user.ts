import { DataTypes, Model, Sequelize } from "sequelize";
import { USER_ROLE } from "../utils/enums";

export interface UserModel extends Model {
  id: number;
  name?: string;
  surname?: string;
  nickName?: string;
  age?: number;
  email: string;
  role: USER_ROLE;
  password: string;
}

export default (sequelize: Sequelize, modelName: string) => {
  const UserModelCtor = sequelize.define<UserModel>(
    modelName,
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nickName: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLE)),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      paranoid: true,
      timestamps: true,
      tableName: "users",
    }
  );
  UserModelCtor.associate = (models: any) => {
    UserModelCtor.hasMany(models.CompletedExercise, {
      foreignKey: { name: "userID" },
    });
  };
  return UserModelCtor;
};
