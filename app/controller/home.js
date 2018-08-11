
const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    // this.ctx.body = `hi, egg-RESTfulAPI!
    // A optimized Node.js RESTful API Server Template based on egg.js.
    // https://github.com/icxcat/egg-RESTfulAPI.git`

    this.ctx.type = 'html'
    // result.res 是一个 stream
    this.ctx.body = require('fs').createReadStream(require('path').join(this.config.baseDir, 'app/public/index.html'))
  }
}

module.exports = HomeController
