module.exports = app => {
  return {
    schedule: {
      interval: app.config.Upload3ReviewCount,
      type: 'worker',
      disable: app.IsHQ
    },
    async task(ctx) {
      const shopinfo = await ctx.service.query.shop3ReviewCount()
      const res = await ctx.curl(app.config.HQServerUrl + '/api/set/shopNeed3ReviewCount', {
        contentType: 'json',
        method: 'POST',
        data: {
          shopid: shopinfo.shopid,
          count: shopinfo.count,
        },
        // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
        dataType: 'json',
        });
      app.logger.debug('3review - ' + JSON.stringify(res.data))
    },
  };
};