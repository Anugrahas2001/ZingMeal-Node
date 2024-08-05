const EntitySchema = require("typeorm").EntitySchema;
const Food = new EntitySchema({
  name: "Food",
  tableName: "foods",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    foodName: {
      type: "varchar",
      nullable: false,
    },
    imageFile: {
      type: "varchar",
    },
    foodDescription: {
      type: "varchar",
      nullable: false,
    },
    foodType: {
      type: "varchar",
      nullable: false,
    },
    foodCategory: {
      type: "varchar",
      nullable: false,
    },
    preparingTime: {
      type: "int",
      nullable: false,
    },
    discount: {
      type: "float",
      nullable: true,
    },
    actualPrice: {
      type: "float",
      nullable: false,
    },
    discountPrice: {
      type: "float",
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
    restaurant: {
      target: "Restaurant",
      type: "many-to-one",
      joinColumn: {
        name: "restaurant_id",
        referencedColumnName: "id",
      },
    },
    rating: {
      target: "Rating",
      type: "one-to-one",
      cascade: true,
    },
    category: {
      target: "Category",
      type: "one-to-one",
      cascade: true,
    },
  },
});

module.exports = { Food };
