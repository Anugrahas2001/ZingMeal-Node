const { EntitySchema } = require("typeorm");

const RefreshToken = new EntitySchema({
  name: "RefreshToken",
  tableName: "refreshtoken",
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
    createdBy: {
      type: "varchar",
      nullable: true,
    },
    createdOn: {
      type: "timestamp",
      nullable: true,
    },
    modifiedBy: {
      type: "varchar",
      nullable: true,
    },
    modifiedOn: {
      type: "timestamp",
      nullable: true,
    },
  },
});

module.exports = { RefreshToken };
