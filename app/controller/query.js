const Controller = require('egg').Controller

class QueryController extends Controller {
  constructor(ctx) {
    super(ctx)
  }

  

  async functionSetting() {
    const { ctx } = this
    const payload = ctx.params
    const fs = await ctx.model.query(`SELECT   fs.FunctionId, fs.ShopId, fs.GoodsId, fs.DeptId, fs.ordermultiple, fs.OrderNum, fs.OrderAmt, fs.DayUpperlimit, 
                fs.DayUpperlimitAmt, fs.LastModifyDT, g.BarcodeID AS barcodeid, g.Name AS goodsname, s.Name AS shopname, 
                d.Name AS deptname
FROM      FunctionSetting AS fs INNER JOIN
                mySHOPSHStock.dbo.Goods AS g ON fs.GoodsId = g.GoodsID INNER JOIN
                mySHOPSHStock.dbo.Shop AS s ON fs.ShopId = s.ID LEFT OUTER JOIN
                mySHOPSHStock.dbo.Dept AS d ON fs.DeptId = d.ID
WHERE   (fs.ShopId = :shopid) AND (fs.FunctionId = :functionid)`,  { replacements: { shopid: payload.shopid, functionid: parseInt(payload.funcid) }, type: ctx.model.QueryTypes.SELECT })
    const res = fs
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

// (async () => {
//   const rawResponse = await fetch('https://httpbin.org/post', {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({a: 1, b: 'Textual content'})
//   });
//   const content = await rawResponse.json();

//   console.log(content);
// })();

 // bs = content.data.map(b =>  ({type:1,id:b.b_id,label:b.b_name})).filter((v, i, a) => a.findIndex( z => z.id == v.id) === i).sort((a,b)=> a.id - b.id)
 async shopGoods() {
    const { ctx } = this
    const payload = ctx.params

    const goods = await ctx.model.query(`WITH goods AS (SELECT   gs.GoodsID AS goods_id, RTRIM(g.BarcodeID) AS barcode_id, RTRIM(g.Name) AS goods_name, 
                                           g.DeptID AS dept_id, RTRIM(d.Name) AS dept_name, CAST(LEFT(g.DeptID, 4) AS int) AS z_id, 
                                           RTRIM(z.Name) AS z_name, CAST(LEFT(g.DeptID, 3) AS int) AS da_id, RTRIM(da.Name) AS da_name, 
                                           CAST(LEFT(g.DeptID, 2) AS int) AS k_id, RTRIM(k.Name) AS k_name, CAST(LEFT(g.DeptID, 1) AS int) 
                                           AS b_id, RTRIM(b.Name) AS b_name
                           FROM      mySHOPSHStock.dbo.GoodsShop AS gs INNER JOIN
                                           mySHOPSHStock.dbo.Goods AS g ON gs.GoodsID = g.GoodsID LEFT OUTER JOIN
                                           mySHOPSHStock.dbo.Dept AS d ON g.DeptID = d.ID LEFT OUTER JOIN
                                           mySHOPSHStock.dbo.SGroup AS z ON z.ID = LEFT(g.DeptID, 4) LEFT OUTER JOIN
                                           mySHOPSHStock.dbo.SGroup AS da ON da.ID = LEFT(g.DeptID, 3) LEFT OUTER JOIN
                                           mySHOPSHStock.dbo.SGroup AS k ON k.ID = LEFT(g.DeptID, 2) LEFT OUTER JOIN
                                           mySHOPSHStock.dbo.SGroup AS b ON b.ID = LEFT(g.DeptID, 1)
                           WHERE   (gs.Flag IN (0, 8)) AND (gs.ShopID = :shopid))
    SELECT   type, id, label, pid
    FROM      (SELECT DISTINCT 1 AS type, b_id AS id, b_name AS label, NULL AS pid
                     FROM      goods
                     UNION
                     SELECT DISTINCT 2 AS type, k_id AS id, k_name AS label, b_id AS pid
                     FROM      goods
                     UNION
                     SELECT DISTINCT 3 AS type, da_id AS id, da_name AS label, k_id AS pid
                     FROM      goods
                     UNION
                     SELECT DISTINCT 4 AS type, z_id AS id, z_name AS label, da_id AS pid
                     FROM      goods
                     UNION
                     SELECT DISTINCT 5 AS type, dept_id AS id, dept_name AS label, z_id AS pid
                     FROM      goods
                     UNION
                     SELECT   6 AS type, goods_id AS id, goods_name AS label, dept_id AS pid
                     FROM      goods) AS a
    ORDER BY pid, id`, { replacements: { shopid: payload.shopid}, type: ctx.model.QueryTypes.SELECT })
    const res = goods
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