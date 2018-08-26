const Controller = require('egg').Controller

class QueryController extends Controller {
  constructor(ctx) {
    super(ctx)
  }

  async shopServerInfo() {
    const { ctx } = this
    const payload = ctx.request.body || {}
    const res = await ctx.model.query(`
SELECT   ssi.ShopId, ssi.ServerUrl, ssi.Need3ReviewCount, s.ID + '-' + s.Name AS shopname
FROM      ${this.config.DBOrderReview}.dbo.ShopServerInfo AS ssi LEFT OUTER JOIN
                ${this.config.DBStock}.dbo.Shop AS s ON ssi.ShopId = s.ID
ORDER BY ssi.Need3ReviewCount DESC
`,  { replacements: { }, type: ctx.model.QueryTypes.SELECT })
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  async master() {
    const { ctx } = this
    const {entity, shopid} = ctx.request.body || {}
    let fields = ''
    if(entity == 'FunctionSetting')
      fields = `[FunctionId]
      ,[ShopId]
      ,[GoodsId]
      ,[DeptId]
      ,[ordermultiple]
      ,[OrderNum]
      ,[OrderAmt]
      ,[DayUpperlimit]
      ,[DayUpperlimitAmt]`
    else if(entity == 'OrderControl')
      fields = `[TypeID]
      ,[ShopID]
      ,[Code]
      ,[SubCode]
      ,[forbidden]`


    let sql = `select ${fields} from ${this.config.DBOrderReview}.dbo.${entity} where shopid=:shopid`
    const res = await ctx.model.query(sql,  { replacements: { shopid }, type: ctx.model.QueryTypes.SELECT })
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  async goodsIdsBySF() {
    const { ctx } = this
    const payload = ctx.request.body
    const fs = await ctx.model.query(`
SELECT  fs.[GoodsId] goodsid
FROM ${this.config.DBOrderReview}.dbo.FunctionSetting AS fs WHERE   (fs.ShopId = :shopid) AND (fs.FunctionId = :functionid) 
`,  { replacements: { shopid: payload.shopid, functionid: parseInt(payload.functionid) }, type: ctx.model.QueryTypes.SELECT })
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res: fs})
  }

  async functionSetting() {
    const { ctx } = this
    const payload = ctx.request.body
    const fs = await ctx.model.query(`
SELECT  *
FROM    (
SELECT ROW_NUMBER() OVER ( ORDER BY fs.GoodsId ) AS RowNum,fs.FunctionId, fs.ShopId, fs.GoodsId, fs.DeptId, fs.ordermultiple, fs.OrderNum, fs.OrderAmt, fs.DayUpperlimit, 
                fs.DayUpperlimitAmt, fs.LastModifyDT, g.BarcodeID AS barcodeid, g.Name AS goodsname, s.Name AS shopname, 
                d.Name AS deptname
FROM      ${this.config.DBOrderReview}.dbo.FunctionSetting AS fs INNER JOIN
                ${this.config.DBStock}.dbo.Goods AS g ON fs.GoodsId = g.GoodsID INNER JOIN
                ${this.config.DBStock}.dbo.Shop AS s ON fs.ShopId = s.ID LEFT OUTER JOIN
                ${this.config.DBStock}.dbo.Dept AS d ON fs.DeptId = d.ID
WHERE   (fs.ShopId = :shopid) AND (fs.FunctionId = :functionid)) as resultRows
WHERE   RowNum between :index and :count
ORDER BY RowNum
`,  { replacements: { shopid: payload.shopid, functionid: parseInt(payload.funcid), index: (payload.curpage - 1) * payload.pagesize + 1, count: (payload.curpage) * payload.pagesize}, type: ctx.model.QueryTypes.SELECT })
    const rs = await ctx.model.query(`SELECT count(1) value
FROM      ${this.config.DBOrderReview}.dbo.FunctionSetting AS fs INNER JOIN
                ${this.config.DBStock}.dbo.Goods AS g ON fs.GoodsId = g.GoodsID INNER JOIN
                ${this.config.DBStock}.dbo.Shop AS s ON fs.ShopId = s.ID 
WHERE   (fs.ShopId = :shopid) AND (fs.FunctionId = :functionid)`,  { replacements: { shopid: payload.shopid, functionid: parseInt(payload.funcid) }, type: ctx.model.QueryTypes.SELECT })
    ctx.logger.debug('fs:'+JSON.stringify(fs))
    ctx.logger.debug('rs'+JSON.stringify(rs))
    const res = { fs, total: rs[0].value }
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
                           FROM      ${this.config.DBStock}.dbo.GoodsShop AS gs INNER JOIN
                                           ${this.config.DBStock}.dbo.Goods AS g ON gs.GoodsID = g.GoodsID LEFT OUTER JOIN
                                           ${this.config.DBStock}.dbo.Dept AS d ON g.DeptID = d.ID LEFT OUTER JOIN
                                           ${this.config.DBStock}.dbo.SGroup AS z ON z.ID = LEFT(g.DeptID, 4) LEFT OUTER JOIN
                                           ${this.config.DBStock}.dbo.SGroup AS da ON da.ID = LEFT(g.DeptID, 3) LEFT OUTER JOIN
                                           ${this.config.DBStock}.dbo.SGroup AS k ON k.ID = LEFT(g.DeptID, 2) LEFT OUTER JOIN
                                           ${this.config.DBStock}.dbo.SGroup AS b ON b.ID = LEFT(g.DeptID, 1)
                           WHERE   (gs.Flag IN (0, 8)) AND (gs.ShopID = :shopid))
    SELECT   type, id,cast(id as varchar)  +' - '+ label label, pid
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

async shopServerUrl() {
    const { ctx } = this
    const payload = ctx.params

    const url = await ctx.model.query(`select [ServerUrl] 
     FROM ${this.config.DBOrderReview}.[dbo].[ShopServerInfo] where ShopId = :shopid`, { replacements: { shopid: payload.shopid}, type: ctx.model.QueryTypes.SELECT })
    const res = url
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }


 async shopTypes() {
    const { ctx } = this
    const shopTypes = await ctx.model.query(`
SELECT     a.ShopID AS shoptypeid, rtrim(b.Name) AS shoptypename, a.ItemShopID AS shopid, rtrim(c.Name) AS shopname
FROM  ${this.config.DBStock}.dbo.ShopItem AS a INNER JOIN
      ${this.config.DBStock}.dbo.Shop AS b ON a.ShopID = b.ID INNER JOIN
      ${this.config.DBStock}.dbo.Shop AS c ON a.ItemShopID = c.ID
WHERE     (c.ShopType IN (11, 13)) AND (c.Enable = 1)
`, { type: ctx.model.QueryTypes.SELECT})
    const res = shopTypes
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  async shop() {
    const { ctx } = this
    const shops = await ctx.model.query(`SELECT a.ID value, a.ID+'-'+RTRIM(a.Name) AS label
FROM      ${this.config.DBStock}.dbo.Shop as a
WHERE    a.ShopType in (11,13) and a.Enable =1`, { type: ctx.model.QueryTypes.SELECT})
    const res = shops
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  async curshop() {
    const { ctx } = this
    let sql = `SELECT a.ID value, a.ID+'-'+RTRIM(a.Name) AS label
FROM      ${this.config.DBStock}.dbo.Shop as a
WHERE   a.ShopType in (11,13) and a.Enable =1`
    if(this.config.IsSC)
      sql += ` and exists (select 1 from ${this.config.DBStock}.dbo.config c where c.Name='本店号' and c.value =a.ID)`
    const shops = await ctx.model.query(sql, { type: ctx.model.QueryTypes.SELECT})
    const res = shops
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }
 
 async rolePermission() {
    const { ctx } = this
    const permissions = await  ctx.model.query(`SELECT   CONVERT(bit,(CASE WHEN b.FunctionId IS NULL THEN 1 ELSE 0 END)) AS isnew, a.PartID AS roleid, a.Name AS rolename, ISNULL(b.FunctionId, 0) AS auth
FROM      ${this.config.DBConnect}.dbo.Part AS a LEFT OUTER JOIN
                ${this.config.DBOrderReview}.dbo.OrgRoleVSFunction AS b ON b.OrgRoleID = a.PartID
ORDER BY roleid`, { type: ctx.model.QueryTypes.SELECT}) 
    const res = permissions
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }



  async orderProperty() {
    const { ctx } = this
    const sps = ctx.request.body.shops || []
    console.log(JSON.stringify(sps))
    const shops = await ctx.model.query(`SELECT CONVERT(bit,(CASE WHEN b.forbidden IS NULL THEN 1 ELSE 0 END)) AS isnew, 1 type, a.ID shopid, RTRIM(a.Name) AS shopname, CONVERT(bit, ISNULL(b.forbidden, 0)) AS forbidden
FROM      ${this.config.DBStock}.dbo.Shop AS a LEFT OUTER JOIN
                ${this.config.DBOrderReview}.dbo.OrderControl AS b ON 
                b.TypeID = 1 AND b.ShopID = a.ID
WHERE   (a.ShopType in (11,13) and a.Enable =1) and a.ID in (:sps)`, { replacements:{ sps }, type: ctx.model.QueryTypes.SELECT})
    ctx.logger.debug('shop list ' + JSON.stringify(shops))
    const mlsxs = await  ctx.model.query(`WITH mlsx AS (SELECT DISTINCT EName
                         FROM      ${this.config.DBStock}.dbo.Goods AS a
                         WHERE   (EName IS NOT NULL) AND (LEN(EShortName) < 4))
    SELECT   CONVERT(bit, (CASE WHEN o.forbidden IS NULL THEN 1 ELSE 0 END)) AS isnew, 2 type, s.ID AS shopid, 
                    s.Name AS shopname, m.EName AS sxid, m.EName AS sxname, CONVERT(bit, ISNULL(o.forbidden, 0)) 
                    AS forbidden
    FROM      ${this.config.DBStock}.dbo.Shop AS s CROSS JOIN
                    mlsx AS m LEFT OUTER JOIN
                    ${this.config.DBOrderReview}.dbo.OrderControl AS o ON o.TypeID = 2 AND s.ID = o.ShopID AND o.Code = m.EName
    WHERE   (s.ShopType IN (11, 13)) AND (s.Enable = 1) and s.ID in (:sps)
    ORDER BY shopid, sxid`, { replacements:{ sps }, type: ctx.model.QueryTypes.SELECT}) 
    const xssxs = await  ctx.model.query(`WITH xssx AS (SELECT DISTINCT EShortName
                         FROM      ${this.config.DBStock}.dbo.Goods AS a
                         WHERE   (EName IS NOT NULL) AND (LEN(EShortName) < 4))
    SELECT   CONVERT(bit, (CASE WHEN o.forbidden IS NULL THEN 1 ELSE 0 END)) AS isnew, 3 type, s.ID AS shopid, 
                    s.Name AS shopname, m.EShortName AS sxid, m.EShortName AS sxname, CONVERT(bit, ISNULL(o.forbidden, 0)) 
                    AS forbidden
    FROM      ${this.config.DBStock}.dbo.Shop AS s CROSS JOIN
                    xssx AS m LEFT OUTER JOIN
                    ${this.config.DBOrderReview}.dbo.OrderControl AS o ON o.TypeID = 3 AND s.ID = o.ShopID AND o.Code = m.EShortName
    WHERE   (s.ShopType IN (11, 13)) AND (s.Enable = 1) and s.ID in (:sps)
    ORDER BY shopid, sxid`, { replacements:{ sps }, type: ctx.model.QueryTypes.SELECT}) 
    const pldxzs = await  ctx.model.query(`SELECT   CONVERT(bit, (CASE WHEN d .forbidden IS NULL THEN 1 ELSE 0 END)) AS isnew, 4 AS type, a.Shopid AS shopid, 
                b.Name AS shopname, c.ID AS deptid, c.Name AS deptname, a.SkuType AS skutype, CONVERT(bit, ISNULL(d.forbidden, 
                0)) AS forbidden
FROM      ${this.config.DBStock}.dbo.hy_deptsku AS a INNER JOIN
                ${this.config.DBStock}.dbo.Shop AS b ON a.Shopid = b.ID INNER JOIN
                ${this.config.DBStock}.dbo.Dept AS c ON a.Deptid = c.ID LEFT OUTER JOIN
                ${this.config.DBOrderReview}.dbo.OrderControl AS d ON d.TypeID = 4 AND d.ShopID = a.Shopid AND d.Code = a.Deptid AND 
                d.SubCode = a.SkuType
WHERE   (b.ShopType IN (11, 13)) AND (b.Enable = 1) and b.ID in (:sps)
ORDER BY shopid, deptid, skutype`, { replacements:{ sps }, type: ctx.model.QueryTypes.SELECT}) 
    const res = {shops, mlsxs, xssxs, pldxzs}
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }


}
module.exports = QueryController