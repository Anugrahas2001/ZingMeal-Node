var EntitySchema = require("typeorm").EntitySchema;
// const {BaseEntity}=require("../model/BaseEntity")

// class Food extends BaseEntity {
//     constructor(foodName, foodImg, foodDescription, foodType, foodCategory, discount, price, createdBy) {
//       super();
//       this.foodName = foodName;
//       this.foodImg = foodImg;
//       this.foodDescription = foodDescription;
//       this.foodType = foodType;
//       this.foodCategory = foodCategory;
//       this.discount = discount;
//       this.price = price;
//       this.setCreateEntity(createdBy);
//     }
//   }

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
      nullable: true,
    },
    foodImg: {
      type: "varchar",
      nullable: true,
    },
    foodDescription: {
      type: "varchar",
      nullable: true,
    },
    foodType: {
      type: "varchar",
      nullable: true,
    },
    foodCategory: {
      type: "varchar",
      nullable: true,
    },
    discount: {
      type: "varchar",
      nullable: true,
    },
    price: {
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
  relations: {
    restuarent: {
      target: "Restuarent",
      type: "many-to-one",
      joinTable: true,
      cascade: true,
    },
  },
});

module.exports = { Food };
