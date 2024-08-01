const { EntitySchema } = require("typeorm");

const Rating = new EntitySchema({
  name: "Rating",
  tableName: "Ratings",
  id: {
    primary: true,
    type: "varchar",
    length: 25,
  },
  itemId: {
    type: "varchar",
    nullable: true,
  },
  itemRating: {
    type: "float",
    nullable: true,
  },
});

module.exports = { Rating };
