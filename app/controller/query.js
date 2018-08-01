const Controller = require('egg').Controller

class QueryController extends Controller {
  constructor(ctx) {
    super(ctx)
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

  async setRolePermission() {
    const { ctx } = this

    const payload = ctx.request.body || {}
    let sql = payload.isnew ? `insert into order_review.dbo.OrgRoleVSFunction(OrgRoleID,FunctionId) 
    values (:roleid,:funcitonid)` : `update order_review.dbo.OrgRoleVSFunction set FunctionId=:funcitonid
    where OrgRoleID=:roleid and FunctionId=:auth_bak`
    const type = payload.isnew ? ctx.model.QueryTypes.INSERT : ctx.model.QueryTypes.UPDATE
    const res = await ctx.model.query(sql,  { replacements: {roleid: payload.roleid, funcitonid: payload.auth, auth_bak: payload.auth_bak}, type})
    ctx.logger.debug('execute result ： ' + JSON.stringify(res))

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


  async setOrderProperty() {
    const { ctx } = this

    const payload = ctx.request.body || {}
    let sql = payload.isnew ? `insert into order_review.dbo.OrderControl(typeid,code,forbidden) 
    values (:typeid,:code,:forbidden)` : `update order_review.dbo.OrderControl set forbidden=:forbidden, LastModifyDT=getdate() 
    where typeid=:typeid and code=:code`
    const type = payload.isnew ? ctx.model.QueryTypes.INSERT : ctx.model.QueryTypes.UPDATE
    const res = await ctx.model.query(sql,  { replacements: {typeid: payload.type, code: payload.id, forbidden: !payload.allowOrder}, type})
    ctx.logger.debug('execute result ： ' + JSON.stringify(res))

    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }


}
module.exports = QueryController