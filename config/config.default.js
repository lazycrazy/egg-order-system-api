module.exports = appInfo => {
  const config = exports = {}
  config.SYS = 'HQ' //'HQ'  'SC'
  config.IsHQ = config.SYS === 'HQ'
  config.IsSC = config.SYS === 'SC'
  config.DBConnect = config.IsHQ ? 'mySHOPHQConnect' : 'mySHOPSHConnect'
  config.DBStock = config.IsHQ ? 'mySHOPHQStock' : 'mySHOPSHStock'
  config.DBOrderReview = config.SYS.toLowerCase() + 'OrderReview'
  config.Upload3ReviewCount = '1m'



  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_15810923947_9527'

  // add your config here
  // 加载 errorHandler 中间件
  config.middleware = [ 'errorHandler' ]

  // 只对 /api 前缀的 url 路径生效
  // config.errorHandler = {
  //   match: '/api',
  // }

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [ 'localhost:9527', 'localhost:9528'  ],
  }

  config.multipart = {
    fileExtensions: [ '.apk', '.pptx', '.docx', '.csv', '.doc', '.ppt', '.pdf', '.pages', '.wav', '.mov' ], // 增加对 .apk 扩展名的支持
  },

  config.bcrypt = {
    saltRounds: 10 // default 10
  }

  config.jwt = {
    secret: 'Great4-M',
    enable: true, // default is false
    match: '/jwt', // optional
  }

  config.bodyParser = {
    jsonLimit: '2mb'
  }
  
  config.sequelize = {
    dialect: 'mssql', // support: mysql, mariadb, postgres, mssql
    database: config.DBOrderReview,
    host: 'localhost',
    port: 3483,
    username: 'sa',
    password: 'sa',
    dialectOptions: {
      options: {
        tdsVersion: '7_2'
      }
    }
  }

  return config
}
