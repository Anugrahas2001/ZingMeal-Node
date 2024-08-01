const { JoinColumn } = require("typeorm");

var EntitySchema = require("typeorm").EntitySchema;

const Restuarent = new EntitySchema({
  name: "Restuarent",
  tableName: "restuarents",
  columns: {
    id: {
      primary: true,
      type: "varchar",
      length: 25,
    },
    restuarentName: {
      type: "varchar",
      nullable: false,
      unique: true,
    },
    restuarentImg: {
      type: "varchar",
      nullable: false,
    },
    restuarentStatus: {
      type: "varchar",
    },
    restuarentPassword: {
      type: "varchar",
      nullable: false,
    },
    openingTime: {
      type: "timestamp",
      createDate: true,
    },
    closingTime: {
      type: "timestamp",
      createDate: true,
    },
    createdBy: {
      type: "varchar",
      nullable: true,
    },
    modifiedBy: {
      type: "varchar",
      nullable: true,
    },
    createdOn: {
      type: "timestamptz",
      nullable: true,
    },
    modifiedOn: {
      type: "timestamptz",
      nullable: true,
    },
  },
  relations: {
    rating: {
      target: "Rating",
      type: "one-to-one",
      JoinColumn: true,
      cascade: true,
    },
  },
});

module.exports = { Restuarent };
