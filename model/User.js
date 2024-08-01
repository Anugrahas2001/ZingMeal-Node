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
  },
});

module.exports = { User };
