const { JoinColumn } = require("typeorm");

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
      nullable: false,
    },
    imageFile: {
      type: "varchar",
      // nullable: true,
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
    discount: {
      type: "varchar",
      nullable: true,
    },
    price: {
      type: "float",
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
    restaurant: {
      target: "Restaurant",
      type: "many-to-one",
      JoinColumn: true,
      cascade: true,
    },
  },
  relations: {
    rating: {
      target: "Rating",
      type: "one-to-one",
      cascade: true,
    },
  },
});

module.exports = { Food };
