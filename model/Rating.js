const { EntitySchema } = require("typeorm");

const Rating = new EntitySchema({
  name: "Rating",
  tableName: "ratings",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    itemId: {
      type: "varchar",
    },
    itemRating: {
      type: "float",
      nullable: true,
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
});

module.exports = { Rating };
