const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

const config = require('./config.js');

if (config.RouteVersion) {
    router.use(`/${config.RouteVersion}`, require(`./views/${config.RouteVersion}/routing`)());
}
else {
    router.use(`/exam-results`, require(`./views/exam-results/routing`)());
    router.use(`/round4-mvp`, require(`./views/round4-mvp/routing`)());
}

module.exports = router;