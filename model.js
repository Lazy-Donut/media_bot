const Sequelize = require("./db");
const { DataTypes } = require("sequelize");

const TokenModel = Sequelize.define("token", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  token: { type: DataTypes.STRING, unique: true },
});

const UserModel = Sequelize.define("user", {
  first_name: { type: DataTypes.STRING, allowNull: true },
  last_name: { type: DataTypes.STRING, allowNull: true },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  telegram_id: { type: DataTypes.BIGINT, unique: true },
  username: { type: DataTypes.STRING, allowNull: true },
});

const ContactModel = Sequelize.define(
  "contact",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    media: { type: DataTypes.STRING, allowNull: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: true },
    media_type: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone_number: { type: DataTypes.STRING, allowNull: true },
    social_media_link: { type: DataTypes.STRING, allowNull: true },
    telegram_username: { type: DataTypes.STRING, allowNull: true },
    specialization: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "contacts",
    timestamps: true,
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

const ModeratorMessage = Sequelize.define("moderator_message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  message: { type: DataTypes.TEXT, allowNull: false },
});

UserModel.hasMany(ContactModel);
ContactModel.belongsTo(UserModel);
UserModel.hasMany(ModeratorMessage);
ModeratorMessage.belongsTo(UserModel);

module.exports = { TokenModel, UserModel, ContactModel, ModeratorMessage };
