'use strict'
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app
  // router.get('/', controller.home.index)

  // role
  // router.post('/api/role', controller.role.create)
  // router.delete('/api/role/:id', controller.role.destroy)
  // router.put('/api/role/:id', controller.role.update)
  // router.get('/api/role/:id', controller.role.show)
  // router.get('/api/role', controller.role.index)
  router.delete('/api/role', app.jwt, controller.role.removes)
  router.resources('role', '/api/role', app.jwt, controller.role)

  router.get('/api/query/shop', app.jwt, controller.query.shop)
  router.get('/api/query/shopTypes', app.jwt, controller.query.shopTypes)
  router.get('/api/query/curshop', app.jwt, controller.query.curshop)
  router.post('/api/query/functionSetting', app.jwt, controller.query.functionSetting)
  router.post('/api/query/goodsIdsBySF', app.jwt, controller.query.goodsIdsBySF)
  router.get('/api/query/shopGoods/:shopid', app.jwt, controller.query.shopGoods)
  router.post('/api/query/orderProperty', app.jwt, controller.query.orderProperty)
  router.get('/api/query/rolePermission', app.jwt, controller.query.rolePermission)
  router.get('/api/query/userInfo', app.jwt, controller.query.userInfo)
  router.get('/api/query/userDepts', app.jwt, controller.query.userDepts)
  
  router.get('/api/sync/user', controller.query.syncUser)


  // query
  router.put('/api/set/orderProperty', app.jwt, controller.set.orderProperty)
  router.put('/api/set/rolePermission', app.jwt, controller.set.rolePermission)
  router.post('/api/set/functionSetting', app.jwt, controller.set.functionSettingNew)
  router.post('/api/set/functionSettingByShop', app.jwt, controller.set.functionSettingByShop)
  router.delete('/api/set/functionSetting', app.jwt, controller.set.deleteFunctionSetting)

  router.get('/api/purchase/reviewAuth', app.jwt, controller.purchase.reviewAuth)
  

  // userAccess
  router.post('/api/user/access/login', controller.userAccess.login)
  router.get('/api/user/access/current', app.jwt, controller.userAccess.current)
  router.post('/api/user/access/logout', controller.userAccess.logout)
  router.put('/api/user/access/resetPsw', app.jwt, controller.userAccess.resetPsw)

  // user
  // router.post('/api/user', controller.user.create)
  // router.delete('/api/user/:id', controller.user.destroy)
  // router.put('/api/user/:id', controller.user.update)
  // router.get('/api/user/:id', controller.user.show)
  // router.get('/api/user', controller.user.index)
  router.delete('/api/user', app.jwt, controller.user.removes)
  router.resources('user', '/api/user', app.jwt, controller.user)

  // upload
  router.post('/api/upload', app.jwt, controller.upload.create)
  router.post('/api/upload/url', app.jwt, controller.upload.url)
  router.post('/api/uploads', app.jwt, controller.upload.multiple)
  router.delete('/api/upload/:id', app.jwt, controller.upload.destroy)
  // router.put('/api/upload/:id', controller.upload.update)
  router.post('/api/upload/:id', app.jwt, controller.upload.update) // Ant Design Pro
  router.put('/api/upload/:id/extra', app.jwt, controller.upload.extra)
  router.get('/api/upload/:id', app.jwt, controller.upload.show)
  router.get('/api/upload', app.jwt, controller.upload.index)
  router.delete('/api/upload', app.jwt, controller.upload.removes)
  // router.resources('upload', '/api/upload', controller.upload)
  if(app.config.IsSC) {
    router.post('/api/purchaseQuery/originqty', app.jwt, controller.purchaseQuery.originqty)
    router.post('/api/query/qtyExport', app.jwt, controller.purchaseQuery.qtyExport)
    router.post('/api/purchaseQuery/listByShop', app.jwt, controller.purchaseQuery.listByShop)
    router.post('/api/purchaseQuery/itemBySheetIds', app.jwt, controller.purchaseQuery.itemBySheetIds)
    router.post('/api/purchase/listByShop', app.jwt, controller.purchase.listByShop)
    router.post('/api/purchase/itemBySheetIds', app.jwt, controller.purchase.itemBySheetIds)
    router.post('/api/purchase/itemReason', app.jwt, controller.purchase.itemReason)
    router.post('/api/purchase/review', app.jwt, controller.purchase.review)
    router.post('/api/purchase/sheetLog', app.jwt, controller.purchase.sheetLog)
    router.post('/api/purchase/updateItemAndLog', app.jwt, controller.purchase.updateItemAndLog)
    router.post('/api/purchase/deleteItemAndLog', app.jwt, controller.purchase.deleteItemAndLog)
    router.post('/api/purchase/reject', app.jwt, controller.purchase.reject)
    router.get('/api/query/purchaseInfos', app.jwt, controller.purchaseQuery.purchaseInfos)

    // router.get('/api/sync/fs', controller.query.syncFunctionSetting)
    // router.get('/api/sync/oc', controller.query.syncOrderControl)
    router.get('/api/sync/master', controller.query.syncMaster)
  }

  if(app.config.IsHQ) {
    router.post('/api/query/shopsSkuType', app.jwt, controller.query.shopsSkuType)
    router.get('/api/query/shopServerUrl/:shopid', app.jwt, controller.query.shopServerUrl)
    router.get('/api/query/shopServerInfo', app.jwt, controller.query.shopServerInfo)
    router.post('/api/query/fsExport', app.jwt, controller.query.fsExport)
    router.post('/api/set/functionSettingImport', app.jwt, controller.set.functionSettingImport)
    router.post('/api/set/shopNeed3ReviewCount', controller.set.shopNeed3ReviewCount)

    router.post('/api/query/master',  controller.query.master)
  }

  router.get('*', controller.home.index)
}
