import { Sequelize, DataTypes, Model } from "sequelize";

export interface CompletedExerciseModel extends Model {
  id: number;
  userID: number;
  exerciseID: number;
  completedAt: Date;
  duration: number; // duration in seconds
}

export default (sequelize: Sequelize, modelName: string) => {
  const CompletedExerciseModelCtor = sequelize.define<CompletedExerciseModel>(
    modelName,
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userID: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      exerciseID: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "completed_exercises",
    }
  );

  CompletedExerciseModelCtor.associate = (models: any) => {
    CompletedExerciseModelCtor.belongsTo(models.User, {
      foreignKey: { name: "userID", allowNull: false },
    });
    CompletedExerciseModelCtor.belongsTo(models.Exercise, {
      foreignKey: { name: "exerciseID", allowNull: false },
    });
  };

  return CompletedExerciseModelCtor;
};
