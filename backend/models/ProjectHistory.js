import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ProjectHistory = sequelize.define('ProjectHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    projectName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    actionType: {
        type: DataTypes.ENUM('create', 'update', 'delete'),
        allowNull: false
    },
    changedFields: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON object containing old and new values for changed fields'
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

export default ProjectHistory;
