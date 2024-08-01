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
    restuarentRatings: {
      type: "float",
    },
    restuarentStatus: {
      type: "varchar",
    },
    restuarentPassword: {
      type: "varchar",
      nullable: false,
    },
    // openingTime: {
    //   type: "timestamp",
    //   createDate: true,
    // },
    // closingTime: {
    //   type: "timestamp",
    //   createDate: true,
    // },
    openingTime: {
      type: "varchar",
      nullable:true
    },
    closingTime: {
      type: "varchar",
      nullable:true
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
});

module.exports = { Restuarent };
