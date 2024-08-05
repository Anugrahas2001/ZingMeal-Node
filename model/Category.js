const EntitySchema = require("typeorm").EntitySchema;

const Category = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    categoryName: {
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
  },
  relations: {
    food: {
      target: "Food",
      type: "one-to-one",
      joinColumn: {
        name: "food_id",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = { Category };
