const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

const config = require('./config.js');

if (config.RouteVersion) {
    router.use(`/${config.RouteVersion}`, require(`./views/${config.RouteVersion}/routing`)());
}

module.exports = router;