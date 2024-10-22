const EntitySchema = require("typeorm").EntitySchema;

const CartItem = new EntitySchema({
  name: "CartItem",
  tableName: "cartitems",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    quantity: {
      type: "int",
      nullable: false,
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
  relations: {
    cart: {
      target: "Cart",
      type: "many-to-one",
      joinColumn: {
        name: "cart_id",
        referencedColumnName: "id",
      },
    },
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

module.exports = { CartItem };
