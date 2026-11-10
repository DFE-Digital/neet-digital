const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

const config = require('./config.js');

const knownRouteVersions = ['exam-results', 'round4-mvp', 'round5-local', 'round6-rebrand'];

// The kit still renders any version's views when ROUTE_VERSION pins a single
// router. Set the layout version from the URL so header, footer and body
// class follow the page being viewed.
router.use((req, res, next) => {
    if (!res.locals.routeVersion) {
        const segment = (req.path.split('/').filter(Boolean)[0] || '');
        if (knownRouteVersions.includes(segment)) {
            res.locals.routeVersion = segment;
        }
    }
    next();
});

if (config.RouteVersion) {
    router.use(`/${config.RouteVersion}`, require(`./views/${config.RouteVersion}/routing`)());
    // Keep the rebrand journey mounted for research even when Heroku is pinned
    // to an earlier version. soleVersion on that earlier version does not 404
    // /round6-rebrand.
    if (config.RouteVersion !== 'round6-rebrand') {
        router.use('/round6-rebrand', require('./views/round6-rebrand/routing')());
    }
}
else {
    router.use(`/exam-results`, require(`./views/exam-results/routing`)());
    router.use(`/round4-mvp`, require(`./views/round4-mvp/routing`)());
    router.use(`/round5-local`, require(`./views/round5-local/routing`)());
    router.use(`/round6-rebrand`, require(`./views/round6-rebrand/routing`)());
}

module.exports = router;