const { EntitySchema } = require("typeorm");

const RefreshToken = new EntitySchema({
  name: "RefreshToken",
  tableName: "refreshToken",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    token: {
      type: "varchar",
      nullable: true,
    },
    itemId: {
      type: "varchar",
      nullable: true,
    },
  },
});

module.exports = { RefreshToken };
