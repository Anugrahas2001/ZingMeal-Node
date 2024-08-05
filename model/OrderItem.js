const { EntitySchema } = require("typeorm");

const OrderItem = new EntitySchema({
  name: "OrderItem",
  tableName: "orderItem",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    quantity: {
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
    order: {
      target: "Order",
      type: "many-to-one",
      joinColumn: {
        name: "order_id",
        referencedColumnName: "id",
      },
    },
    food: {
      target: "Food",
      type: "many-to-one",
      joinColumn: {
        name: "food_id",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = { OrderItem };
