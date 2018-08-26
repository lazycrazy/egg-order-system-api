module.exports = app => {
    const { STRING, INTEGER, DATE, DECIMAL, BOOLEAN, DataTypes } = app.Sequelize

    const OrderControl = app.model.define('OrderControl', {
      TypeID: INTEGER,
      ShopID: STRING(10),
      Code: STRING(10),
      SubCode: STRING(10),
      forbidden: BOOLEAN, 
      // LastModifyDT: {
      //   type: DATE,
      //   defaultValue: DataTypes.NOW
      // }
    }, {
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: false,
    })
    return OrderControl
}