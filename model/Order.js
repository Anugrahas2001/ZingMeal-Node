const { JoinColumn } = require("typeorm");

const EntitySchema = require("typeorm").EntitySchema;

const Order = new EntitySchema({
  name: "Order",
  tableName: "order",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    orderStatus: {},
    totalPrice: {
      type: "float",
      nullable: false,
    },
    paymentStatus: {},
    paymentMethods: {},
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
    user: {
      target: "User",
      type: "many-to-one",
      JoinColumn: true,
    },
  },
});

module.exports = { Order };
