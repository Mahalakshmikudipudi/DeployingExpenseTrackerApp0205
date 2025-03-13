const { DataTypes } = require('sequelize');
const sequelize = require('../util/database'); // Import your DB connection
const User = require('../models/users'); // Import User model

const ForgotPasswordRequests = sequelize.define('ForgotPasswordRequests', {
    id: {
        type: DataTypes.UUID,  // Generate UUIDs
        defaultValue: DataTypes.UUIDV4, 
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, 
            key: 'id'
        },
        onDelete: 'CASCADE'  // If user is deleted, delete their requests too
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = ForgotPasswordRequests;
