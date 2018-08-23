module.exports = app => {
    const { STRING, INTEGER, DATE } = app.Sequelize;

    const FunctionSettingImport = app.model.define('FunctionSettingImport', {
        Col1: STRING(10),
        Col2: STRING(10),
        Col3: STRING(10),
        Col4: STRING(10),
        Col5: STRING(10),
        Col6: STRING(10),
        Col7: STRING(10),
        Col8: STRING(10)
    }, {
        freezeTableName: true, // Model tableName will be the same as the model name
        timestamps: false,
    });
    return FunctionSettingImport;
};