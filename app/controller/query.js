const Controller = require('egg').Controller

class QueryController extends Controller {
  constructor(ctx) {
    super(ctx)
  }

  

  async functionSetting() {
    const { ctx } = this
    const payload = ctx.request.body || {}
    const fs = await ctx.model.query(`SELECT   fs.FunctionId, fs.ShopId, fs.GoodsId, fs.DeptId, fs.ordermultiple, fs.OrderNum, fs.OrderAmt, fs.DayUpperlimit, 
                fs.DayUpperlimitAmt, fs.LastModifyDT, g.BarcodeID AS barcodeid, g.Name AS goodname, s.Name AS shopname, 
                d.Name AS deptname
FROM      FunctionSetting AS fs INNER JOIN
                mySHOPSHStock.dbo.Goods AS g ON fs.GoodsId = g.GoodsID INNER JOIN
                mySHOPSHStock.dbo.Shop AS s ON fs.ShopId = s.ID LEFT OUTER JOIN
                mySHOPSHStock.dbo.Dept AS d ON fs.DeptId = d.ID
WHERE   (fs.ShopId = :shopid) AND (fs.FunctionId = :functionid)`,  { replacements: { shopid: payload.shopid, funcitonid: payload.funcitonid }, type: ctx.model.QueryTypes.SELECT })
    const res = fs
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

 async shopGoods() {
    const { ctx } = this
    const payload = ctx.request.body || {}
    const shops = await ctx.model.query(`SELECT   gs.GoodsID, g.BarcodeID AS barcodeid, g.Name AS goodname
FROM      mySHOPSHStock.dbo.GoodsShop AS gs INNER JOIN
                mySHOPSHStock.dbo.Goods AS g ON gs.GoodsID = g.GoodsID
WHERE   (gs.ShopId = :shopid)`, { replacements: { shopid: payload.shopid}, type: ctx.model.QueryTypes.SELECT })
    const res = shopGoods
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  async shop() {
    const { ctx } = this
    const shops = await ctx.model.query(`SELECT a.ID value, RTRIM(a.Name) AS label
FROM      mySHOPSHStock.dbo.Shop as a
WHERE   (a.ShopType = 11)`, { type: ctx.model.QueryTypes.SELECT})
    const res = shops
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }
 
 async rolePermission() {
    const { ctx } = this
    const permissions = await  ctx.model.query(`SELECT   CONVERT(bit,(CASE WHEN b.FunctionId IS NULL THEN 1 ELSE 0 END)) AS isnew, a.PartID AS roleid, a.Name AS rolename, ISNULL(b.FunctionId, 0) AS auth
FROM      mySHOPSHConnect.dbo.Part AS a LEFT OUTER JOIN
                OrgRoleVSFunction AS b ON b.OrgRoleID = a.PartID
ORDER BY roleid`, { type: ctx.model.QueryTypes.SELECT}) 
    const res = permissions
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }



  async orderProperty() {
    const { ctx } = this
    const shops = await ctx.model.query(`SELECT CONVERT(bit,(CASE WHEN b.forbidden IS NULL THEN 1 ELSE 0 END)) AS isnew, 1 type, a.ID id, RTRIM(a.Name) AS name, CONVERT(bit, ISNULL(b.forbidden, 0)) AS forbidden
FROM      mySHOPSHStock.dbo.Shop AS a LEFT OUTER JOIN
                order_review.dbo.OrderControl AS b ON b.TypeID = 1 AND b.Code = a.ID
WHERE   (a.ShopType = 11)`, { type: ctx.model.QueryTypes.SELECT})
    ctx.logger.debug('shop list ' + JSON.stringify(shops))
    const mlsxs = await  ctx.model.query(`SELECT DISTINCT CONVERT(bit,(CASE WHEN b.forbidden IS NULL THEN 1 ELSE 0 END)) AS isnew, 2 type, a.EName AS id, a.EName AS name, CONVERT(bit, ISNULL(b.forbidden, 0)) AS forbidden
FROM      mySHOPSHStock.dbo.Goods AS a LEFT OUTER JOIN
                order_review.dbo.OrderControl AS b ON b.TypeID = 2 AND b.Code = a.EName
WHERE   (a.EName IS NOT NULL) AND (LEN(a.EShortName) < 4)
order by a.ename`, { type: ctx.model.QueryTypes.SELECT}) 
    const xssxs = await  ctx.model.query(`SELECT DISTINCT CONVERT(bit,(CASE WHEN b.forbidden IS NULL THEN 1 ELSE 0 END)) AS isnew, 3 type,a.EShortName AS id, a.EShortName AS name, CONVERT(bit, ISNULL(b.forbidden, 0)) AS forbidden
FROM      mySHOPSHStock.dbo.Goods AS a LEFT OUTER JOIN
                order_review.dbo.OrderControl AS b ON b.TypeID = 3 AND b.Code = a.EShortName
WHERE   (a.EShortName IS NOT NULL) AND (LEN(a.EShortName) < 4)
ORDER BY id`, { type: ctx.model.QueryTypes.SELECT}) 
    const pldxzs = await  ctx.model.query(`SELECT CONVERT(bit,(CASE WHEN d.forbidden IS NULL THEN 1 ELSE 0 END)) AS isnew, 4 type, a.Shopid + '-' + CONVERT(varchar, a.Deptid) + '-' + a.SkuType AS id, b.Name AS storename, c.Name AS deptname, 
                a.SkuType skutype, CONVERT(bit, ISNULL(d.forbidden, 0)) AS forbidden
FROM      mySHOPSHStock.dbo.hy_deptsku AS a LEFT OUTER JOIN
                mySHOPSHStock.dbo.Shop AS b ON a.Shopid = b.ID LEFT OUTER JOIN
                mySHOPSHStock.dbo.Dept AS c ON a.Deptid = c.ID LEFT OUTER JOIN
                order_review.dbo.OrderControl AS d ON d.TypeID = 4 AND d.Code = a.Shopid + '-' + CONVERT(varchar, a.Deptid) 
                + '-' + a.SkuType
ORDER BY storename, a.SkuType, deptname`, { type: ctx.model.QueryTypes.SELECT}) 
    const res = {shops, mlsxs, xssxs, pldxzs}
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }


}
module.exports = QueryController