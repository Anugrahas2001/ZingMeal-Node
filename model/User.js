const { types } = require("pg");

var EntitySchema = require("typeorm").EntitySchema;

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    name: {
      type: "varchar",
    },
    email: {
      type: "varchar",
      nullable: false,
      unique: true,
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    createdBy: {
      type: "varchar",
      nullable: true,
    },
    createdOn: {
      type: "timestamptz",
      nullable: true,
    },
    modifiedBy: {
      type: "varchar",
      nullable: true,
    },
    modifiedOn: {
      type: "timestamptz",
      nullable: true,
    },
  },
  relations: {
    refreshToken: {
      target: "RefreshToken",
      type: "one-to-one",
      inverseSide: "refreshToken",
      cascade: true,
    },
  },
});

module.exports = { User };
