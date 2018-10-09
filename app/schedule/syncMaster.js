module.exports = app => {
  return {
    schedule: {
      interval: '3h',
      type: 'worker',
      disable: app.config.IsHQ
    },
    async task(ctx) {
      await ctx.service.query.syncMaster()
    },
  };
};