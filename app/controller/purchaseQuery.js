const Controller = require('egg').Controller

class PurchaseQueryController extends Controller {
  constructor(ctx) {
    super(ctx)
  } 

  async originqty() {
    const { ctx } = this
    const payload = ctx.request.body 
    let cdi1 = ''
    let cdi2 = ''
    if(payload.sheetid && payload.sheetid.length > 0) {
        cdi1 += ` and pcil.sheetid=:sheetid ` 
        cdi2 += ` and pa.sheetid=:sheetid ` 
    }
    if(payload.barcodeid && payload.barcodeid.length > 0) {
        cdi1 += ` and pcil.barcodeid=:barcodeid ` 
        cdi2 += ` and pai.barcodeid=:barcodeid ` 
    }
     if(payload.shopid && payload.shopid.length > 0) { 
        cdi2 += ` and pa.shopid=:shopid ` 
    }
    //查询0表
    const fs = await ctx.model.query(`
WITH originrow AS (SELECT   SheetID, GoodsID, MIN(LogTime) AS logtime
                                FROM     ${this.config.DBOrderReview}.dbo.PurchaseControlItemLogs AS pcil
                                WHERE   (GoodsID IS NOT NULL) AND (LogTime >= :dates) AND (LogTime <= DATEADD(day,1,:datee)) 
               ${cdi1} 
                                GROUP BY SheetID, GoodsID), originqty AS
    (SELECT   pcil.SheetID, pcil.GoodsID, SUM(pcil.Qty) AS oqty
     FROM      ${this.config.DBOrderReview}.dbo.PurchaseControlItemLogs AS pcil INNER JOIN
                     originrow ON pcil.SheetID = originrow.SheetID AND pcil.GoodsID = originrow.GoodsID AND 
                     pcil.LogTime = originrow.logtime
     GROUP BY pcil.SheetID, pcil.GoodsID), rs AS
    (SELECT   pa.ShopID AS shopid, CONVERT(VARCHAR(10), pa.CheckDate, 111) AS editdate, pai.GoodsID AS goodsid, 
                     SUM(ISNULL(originqty.oqty, pai.Qty)) AS oqty, SUM(pai.Qty) AS qty
     FROM      ${this.config.DBStock}.dbo.PurchaseAsk AS pa INNER JOIN
                     ${this.config.DBStock}.dbo.PurchaseAskItem AS pai ON pa.SheetID = pai.SheetID LEFT OUTER JOIN
                     originqty ON pai.SheetID = originqty.SheetID AND pai.GoodsID = originqty.GoodsID
           where (pa.CheckDate >= :dates) AND (pa.CheckDate <= DATEADD(day,1,:datee))
           ${cdi2} 
     GROUP BY pa.ShopID, CONVERT(VARCHAR(10), pa.CheckDate, 111), pai.GoodsID),rsp as
   (SELECT  ROW_NUMBER() OVER ( ORDER BY rs.shopid, rs.editdate, rs.goodsid ) AS RowNum, rs.shopid, rs.editdate, rs.goodsid, rs.oqty, rs.qty, g.CustomNo AS customno, g.Name AS goodsname, 
                    g.BarcodeID AS barcodeid, mo.MinOrderQty AS minorderqty, s.Name AS shopname,d.ID deptid,d.Name deptname,sg.ID kid,sg.Name kname
    FROM      rs LEFT OUTER JOIN
                    ${this.config.DBStock}.dbo.Goods AS g ON g.GoodsID = rs.goodsid LEFT OUTER JOIN
                    ${this.config.DBStock}.dbo.MinOrder AS mo ON mo.GoodsID = rs.goodsid AND mo.ShopID = rs.shopid LEFT OUTER JOIN
                    ${this.config.DBStock}.dbo.Shop AS s ON rs.shopid = s.ID LEFT OUTER JOIN  
                    ${this.config.DBStock}.dbo.Dept d on d.ID = g.DeptID LEFT OUTER JOIN  
                    ${this.config.DBStock}.dbo.SGroup sg on sg.ID = left(g.DeptID,2))
          select * from rsp  WHERE   RowNum between :index and :count
ORDER BY RowNum
`,  { replacements: { shopid: payload.shopid, sheetid: payload.sheetid, barcodeid: payload.barcodeid, dates: payload.dates, datee: payload.datee, index: (payload.curpage - 1) * payload.pagesize + 1, count: (payload.curpage) * payload.pagesize}, type: ctx.model.QueryTypes.SELECT })
    const rs = await ctx.model.query(`
WITH originrow AS (SELECT   SheetID, GoodsID, MIN(LogTime) AS logtime
                                FROM     ${this.config.DBOrderReview}.dbo.PurchaseControlItemLogs AS pcil
                                WHERE   (GoodsID IS NOT NULL) AND (LogTime >= :dates) AND (LogTime <= DATEADD(day,1,:datee)) 
               ${cdi1} 
                                GROUP BY SheetID, GoodsID), originqty AS
    (SELECT   pcil.SheetID, pcil.GoodsID, SUM(pcil.Qty) AS oqty
     FROM      ${this.config.DBOrderReview}.dbo.PurchaseControlItemLogs AS pcil INNER JOIN
                     originrow ON pcil.SheetID = originrow.SheetID AND pcil.GoodsID = originrow.GoodsID AND 
                     pcil.LogTime = originrow.logtime
     GROUP BY pcil.SheetID, pcil.GoodsID), rs AS
    (SELECT   pa.ShopID AS shopid, CONVERT(VARCHAR(10), pa.CheckDate, 111) AS editdate, pai.GoodsID AS goodsid, 
                     SUM(ISNULL(originqty.oqty, pai.Qty)) AS oqty, SUM(pai.Qty) AS qty
     FROM      ${this.config.DBStock}.dbo.PurchaseAsk AS pa INNER JOIN
                     ${this.config.DBStock}.dbo.PurchaseAskItem AS pai ON pa.SheetID = pai.SheetID LEFT OUTER JOIN
                     originqty ON pai.SheetID = originqty.SheetID AND pai.GoodsID = originqty.GoodsID
           where (pa.CheckDate >= :dates) AND (pa.CheckDate <= DATEADD(day,1,:datee))
           ${cdi2} 
     GROUP BY pa.ShopID, CONVERT(VARCHAR(10), pa.CheckDate, 111), pai.GoodsID)
    SELECT count(1) as value 
    FROM   rs `,  { replacements: { shopid: payload.shopid, sheetid: payload.sheetid, barcodeid: payload.barcodeid, dates: payload.dates, datee: payload.datee }, type: ctx.model.QueryTypes.SELECT })
    const res = { fs, total: rs[0].value }

    ctx.logger.debug('res'+JSON.stringify(res))
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }
 
  async listByShop() {
    const { ctx } = this
    const payload = ctx.request.body
    const auth = payload.auth
    const lr = payload.lr
    let cdi = ''
    let cdiAuth = ''
    if(payload.checkAuth){
      if(auth < 1)
        throw new Error('没有审批权限') 
        cdiAuth = ` and exists (select 1 from ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs] l where 
               l.SheetID = p.sheetid and l.serialid = -12) ` 
      if(auth === 1)
        cdiAuth = ` and not exists (select 1 from ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs] l where 
               l.SheetID = p.sheetid and l.serialid = -11) `
      else if(auth === 2)
        cdiAuth = ` and exists (select 1 from ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs] l where 
               l.SheetID = p.sheetid and l.serialid = -11)
                and not exists (select 1 from ${this.config.DBOrderReview}.[dbo].[PurchaseControlItemLogs] l where 
               l.SheetID = p.sheetid and l.serialid = -12) `
    }
    
    if(payload.editDateS) {
        cdi += ` and p.CheckDate >= :editDateS ` 
    }
    if(payload.editDateE) {
        cdi += ` and p.CheckDate <= DATEADD(day,1,:editDateE) ` 
    }
    if(payload.sheetid && payload.sheetid.length > 0) {
        cdi += ` and p.sheetid=:sheetid ` 
    }

    cdi += cdiAuth
    //查询0表
    let fs = []
    let total = 0
    if(lr === 2 || lr === 0) {
      fs = await ctx.model.query(`
SELECT  *
FROM    (
SELECT ROW_NUMBER() OVER ( ORDER BY p.EditDate ) AS RowNum,p.SheetID, p.ShopID, p.ManageDeptID, p.AskType, p.Flag, p.Editor, p.EditDate, p.Operator, p.Checker, p.CheckDate, 
                p.Notes, p.PrintCount, s.Name AS ShopName
FROM      ${this.config.DBStock}.dbo.PurchaseAsk0 AS p LEFT OUTER JOIN
                ${this.config.DBStock}.dbo.Shop AS s ON p.ShopID = s.ID
WHERE   (p.ShopId = :shopid) ${cdi.replace(/CheckDate/g, 'EditDate')} ) as resultRows
WHERE   RowNum between :index and :count
ORDER BY RowNum
`,  { replacements: { shopid: payload.shopid, sheetid: payload.sheetid, editDateS: payload.editDateS, editDateE: payload.editDateE, index: (payload.curpage - 1) * payload.pagesize + 1, count: (payload.curpage) * payload.pagesize}, type: ctx.model.QueryTypes.SELECT })
    const rs = await ctx.model.query(`
    	SELECT count(1) as value 
FROM      ${this.config.DBStock}.dbo.PurchaseAsk0 AS p LEFT OUTER JOIN
                ${this.config.DBStock}.dbo.Shop AS s ON p.ShopID = s.ID
WHERE   (p.ShopId = :shopid) ${cdi.replace(/CheckDate/g, 'EditDate')} 
       `,  { replacements: { shopid: payload.shopid, sheetid: payload.sheetid, editDateS: payload.editDateS, editDateE: payload.editDateE }, type: ctx.model.QueryTypes.SELECT })
      total = rs[0].value
    }
    //查询正式表
    let fs1 = []
    let total1 = 0
    if(lr === 2 || lr === 1) {
      fs1 = await ctx.model.query(`
SELECT  *
FROM    (
SELECT ROW_NUMBER() OVER ( ORDER BY p.CheckDate ) AS RowNum,p.SheetID, p.ShopID, p.ManageDeptID, p.AskType, p.Flag, p.Editor, p.EditDate, p.Operator, p.Checker, p.CheckDate, 
                p.Notes, p.PrintCount, s.Name AS ShopName
FROM      ${this.config.DBStock}.dbo.PurchaseAsk AS p LEFT OUTER JOIN
                ${this.config.DBStock}.dbo.Shop AS s ON p.ShopID = s.ID
WHERE   (p.ShopId = :shopid) ${cdi} ) as resultRows
WHERE   RowNum between :index and :count
ORDER BY RowNum
`,  { replacements: { shopid: payload.shopid, sheetid: payload.sheetid, editDateS: payload.editDateS, editDateE: payload.editDateE, index: (payload.curpage_x - 1) * payload.pagesize_x + 1, count: (payload.curpage_x) * payload.pagesize_x}, type: ctx.model.QueryTypes.SELECT })
    const rs1 = await ctx.model.query(`
      SELECT count(1) as value 
FROM      ${this.config.DBStock}.dbo.PurchaseAsk AS p LEFT OUTER JOIN
                ${this.config.DBStock}.dbo.Shop AS s ON p.ShopID = s.ID
WHERE   (p.ShopId = :shopid) ${cdi} `,  { replacements: { shopid: payload.shopid, sheetid: payload.sheetid, editDateS: payload.editDateS, editDateE: payload.editDateE }, type: ctx.model.QueryTypes.SELECT })
      total1 = rs1[0].value
    }
    const res = { fs, total, fs1, total1 }

    ctx.logger.debug('res'+JSON.stringify(res))
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

  

  async itemBySheetIds() {
    const { ctx } = this
    const payload = ctx.request.body
    const itemsp = ctx.model.query(`SELECT i.*,g.Name goodsname, ${this.config.DBOrderReview}.dbo.F_CheckPurchaseItem(SheetID,i.GoodsID,:auth) reason
FROM      ${this.config.DBStock}.dbo.PurchaseAskItem0 i left join ${this.config.DBStock}..Goods g on g.GoodsID = i.GoodsID
WHERE   (SheetID IN (:sheetids)) order by serialid
`,  { replacements: { sheetids: payload.sheetids, auth: payload.auth }, type: ctx.model.QueryTypes.SELECT })

    const itemsp1 = ctx.model.query(`SELECT i.*,g.Name goodsname, ${this.config.DBOrderReview}.dbo.F_CheckPurchaseItem(SheetID,i.GoodsID,:auth) reason
FROM      ${this.config.DBStock}.dbo.PurchaseAskItem i left join ${this.config.DBStock}..Goods g on g.GoodsID = i.GoodsID
WHERE   (SheetID IN (:sheetids)) order by serialid
`,  { replacements: { sheetids: payload.sheetids, auth: payload.auth }, type: ctx.model.QueryTypes.SELECT })

    const logsp = ctx.model.query(`SELECT  l.*,u.Name LogUser FROM      ${this.config.DBOrderReview}.dbo.[PurchaseControlItemLogs] l left JOIN
        ${this.config.DBConnect}.dbo.Login  u on l.LogUserID = u.LoginID
WHERE   (SheetID IN (:sheetids)) order by LogTime
`,  { replacements: { sheetids: payload.sheetids }, type: ctx.model.QueryTypes.SELECT })
    const p2 = await Promise.all([itemsp, itemsp1, logsp])
    const res = p2
    // 设置响应内容和响应状态码
    ctx.helper.success({ctx, res})
  }

}
module.exports = PurchaseQueryController