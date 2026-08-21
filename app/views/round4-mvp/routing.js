module.exports = () => {

    const govukPrototypeKit = require('govuk-prototype-kit');
    const router = govukPrototypeKit.requests.setupRouter();
    const DEBUG = (process.env.npm_lifecycle_event == "dev");

    const config = require('../../config.js');
    const routeVersion = "round4-mvp";

    const base = `/${routeVersion}`;

    router.use((req, res, next) => {
        if (!req.originalUrl.startsWith(base)) {
            next();
            return;
        };

        res.locals.DEBUG = DEBUG;
        res.locals.routeVersion = routeVersion;  

        delete (res.locals.backlinkUrl);
        const referer = req.get('Referer') || "";

        req.session.data.analyticsConsent = 'no';
        req.session.data.history = req.session.data.history || [];

        if (req.method == 'GET' && referer && req.session.data.history[1] != referer) {
            if (req.session.data.history.push(referer) > 2) {
                req.session.data.history.shift();
            }
        }

        next();
    });

    // ----------------------------------------------------------------------------------------------------------------
    // Step Validation
    // ----------------------------------------------------------------------------------------------------------------

    const steps = Object.freeze({
        whats_your_first_name: 1,
        current_situation: 2,
        what_help: 3,
        what_help_dynamic: 4,
        where_are_you_at_with_education: 5,
        check_your_answers: 6,
        what_you_can_do_next: 7
    });

    function updateStepReached(req, step) {
        if (!req.session.data.stepReached) {
            req.session.data.stepReached = 0;
        }
        req.session.data.stepReached = Math.max(req.session.data.stepReached, step);
    }

    function canProceedToStep(req, step) {
        if (!req.session.data.stepReached) {
            req.session.data.stepReached = 0;
        }

        return (step <= (req.session.data.stepReached + 1));
    }

    // Home page route

    const soleVersion = config.RouteVersion && config.RouteVersion == routeVersion;

    if (soleVersion) {

        router.get('/', (req, res) => {
            res.redirect(`/round4-mvp/landing-page`);
        });

        router.get('/index', (req, res) => {
            res.redirect(`/round4-mvp/landing-page`);
        });

        router.get('/layouts/*', (req, res) => {
            const path = req.path
            res.render('custom_node_modules/govuk-prototype-kit/lib/nunjucks/views/error-handling/page-not-found.njk', {
                path
            })
        });

        router.get('/older-prototype/*', (req, res) => {
            const path = req.path
            res.render('custom_node_modules/govuk-prototype-kit/lib/nunjucks/views/error-handling/page-not-found.njk', {
                path
            })
        });

        router.get('/exam-results/*', (req, res) => {
            const path = req.path
            res.render('custom_node_modules/govuk-prototype-kit/lib/nunjucks/views/error-handling/page-not-found.njk', {
                path
            })
        });
    }

    // ----------------------------------------------------------------------------------------------------------------
    // Cookie management cookieConsentGiven
    // ----------------------------------------------------------------------------------------------------------------

    function cookieConsentGiven(req) {
        const analyticsConsent = req.session && req.session.data && req.session.data.analyticsConsent;
        return (analyticsConsent === 'yes');
    }

    router.get('/round4-mvp/accept-cookies', function (req, res) {
        req.session.data.analyticsConsent = 'yes';
        res.redirect('back');
    });

    router.get('/round4-mvp/reject-cookies', function (req, res) {
        req.session.data.analyticsConsent = 'no'
        res.redirect('/round4-mvp/landing-page');
    });

    router.post('/round4-mvp/cookies', function (req, res) {
        if (req.body.analyticsConsent === 'yes') {
            req.session.data.analyticsConsent = req.body.analyticsConsent;
        }

        res.redirect('/round4-mvp/landing-page');
    });

    // ----------------------------------------------------------------------------------------------------------------
    // NavigationValidation
    // ----------------------------------------------------------------------------------------------------------------

    function navigationValidation(step) {
        return function (req, res, next) {
            // allow only if cookie consent given and the step is not beyond the next allowed step
            if (canProceedToStep(req, step)) {
                next();
                return;
            }

            return res.redirect('/round4-mvp/landing-page');
        };
    }

    // ----------------------------------------------------------------------------------------------------------------
    // Helper to resolve redirect from the POST action query string (?redirect=...)
    function resolvePostRedirect(req, defaultRedirect) {
        const redirectParam = req.query && req.query.redirectUrl ? String(req.query.redirectUrl).trim() : '';
        if (!redirectParam) return defaultRedirect;

        // Block external schemes (http:, https:, data:, etc.) and scheme-relative URLs
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(redirectParam) || redirectParam.startsWith('//')) {
            return defaultRedirect;
        }

        // If absolute path provided, use it
        if (redirectParam.startsWith('/')) {
            return redirectParam;
        }

        // Otherwise treat as a slug and normalize underscores to hyphens
        return `${base}/${redirectParam.replace(/_/g, '-')}`;
    };

    function resolveSubmitRedirect(req, res, historySignature) {
        historySignature = Array.isArray(historySignature) ? historySignature : [historySignature];
        // Check if trailing items in history match the historySignature (loop prevention)
        const historyLength = req.session.data.history.length;
        const signatureLength = historySignature.length;

        if (historyLength >= signatureLength) {
            let matches = true;
            for (let i = 0; i < signatureLength; i++) {
                const historyIndex = historyLength - signatureLength + i;
                if (!req.session.data.history[historyIndex].endsWith(historySignature[i])) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                return `${base}/check-your-answers`;
            }
        }
    }

    // ----------------------------------------------------------------------------------------------------------------
    // Whats your first name
    // ----------------------------------------------------------------------------------------------------------------

    router.get('/round4-mvp/whats-your-first-name', navigationValidation(steps.whats_your_first_name), (req, res) => {
        res.locals.backlinkUrl = resolveSubmitRedirect(req, res, `${base}/check-your-answers`);
        return res.render('/round4-mvp/whats-your-first-name');
    });

    router.post('/round4-mvp/whats-your-first-name', navigationValidation(steps.whats_your_first_name), (req, res) => {
        updateStepReached(req, steps.whats_your_first_name);

        const redirectTo = resolvePostRedirect(req, '/round4-mvp/current-situation',);
        return res.redirect(redirectTo);
    });

    // ----------------------------------------------------------------------------------------------------------------
    // Current situation 
    // ----------------------------------------------------------------------------------------------------------------

    router.get('/round4-mvp/current-situation', navigationValidation(steps.current_situation), (req, res) => {
        res.locals.backlinkUrl = resolveSubmitRedirect(req, res, `${base}/check-your-answers`);
        return res.render('/round4-mvp/current-situation');
    });

    router.post('/round4-mvp/current-situation', navigationValidation(steps.current_situation), (req, res) => {

        const errors = {};

        if (!(req.session?.data?.feeling) || req.session.data.feeling.length == 0) {
            errors['page'] = {
                "text": "Select at least one option that reflects how you’re doing, or select 'I do not want to say how I’m feeling today",
                "href": "#feeling"
            };
        }

        errors.HasErrors = Object.keys(errors).length > 0;

        if (errors.HasErrors) {
            return res.render('/round4-mvp/current-situation', { errors: errors });
        }

        updateStepReached(req, steps.current_situation);

        const redirectTo = resolvePostRedirect(req, `${base}/what-help`);
        return res.redirect(redirectTo);
    });

    // ----------------------------------------------------------------------------------------------------------------
    // What help 
    // ----------------------------------------------------------------------------------------------------------------

    router.get('/round4-mvp/what-help', navigationValidation(steps.what_help), (req, res) => {
        return res.render('/round4-mvp/what-help');
    });

    router.post('/round4-mvp/what-help', navigationValidation(steps.what_help), (req, res) => {

        const errors = {};

        if (!(req.session?.data?.route) || req.session.data.route.length == 0) {
            errors['page'] = {
                "text": "Select at least one option that reflects what you need help with",
                "href": "#route-1"
            };
        }

        errors.HasErrors = Object.keys(errors).length > 0;

        if (errors.HasErrors) {
            return res.render('/round4-mvp/what-help', { errors: errors });
        }

        const valueDislikeCourse = "I’m unsure about my current course or what to do when I finish";
        const valuePassingResit = "I need to pass my GCSE maths or English resit";
        const valueJobsOrApprenticeship = "I'm stuck applying for jobs or apprenticeships";
        const valueCVorWork = "I need help with my CV or getting work experience";

        if (!req.session.data.route.includes(valueDislikeCourse)) {
            req.session.data['course-checkbox'] = [];
        }

        if (!req.session.data.route.includes(valuePassingResit)) {
            req.session.data['gcse-checkbox'] = [];
        }

        if (!req.session.data.route.includes(valueJobsOrApprenticeship)) {
            req.session.data['jobs-checkbox'] = [];
        }

        if (!req.session.data.route.includes(valueCVorWork)) {
            req.session.data['cv-checkbox'] = [];
        }

        updateStepReached(req, steps.what_help);

        //const redirectTo = resolvePostRedirect(req, '/round4-mvp/what-help-dynamic
        res.locals.backlinkUrl = "xxxx";
        return res.redirect('/round4-mvp/what-help-dynamic');
    });

    // ----------------------------------------------------------------------------------------------------------------
    // What help dynamic (What are you finding difficult?)
    // ----------------------------------------------------------------------------------------------------------------

    router.get('/round4-mvp/what-help-dynamic', navigationValidation(steps.what_help_dynamic), (req, res) => {
        res.locals.backlinkUrl = resolveSubmitRedirect(req, res, [`${base}/check-your-answers`]) ||
            resolveSubmitRedirect(req, res, [`${base}/check-your-answers`, `${base}/what-help`]);

        delete (req.session.data.courseOptionsIncluded);
        delete (req.session.data.gcseOptionsIncluded);
        delete (req.session.data.jobsOptionsIncluded);
        delete (req.session.data.cvOptionsIncluded);

        return res.render('/round4-mvp/what-help-dynamic');
    });

    router.post('/round4-mvp/what-help-dynamic', navigationValidation(steps.what_help_dynamic), (req, res) => {
        const errors = {};
        errors.HasErrors = false;

        let d = req.session.data;
        const routes = [].concat(d["course-checkbox"]).concat(d["gcse-checkbox"])
            .concat(d["jobs-checkbox"]).concat(d["cv-checkbox"])
            .filter(item => typeof item !== 'undefined');
        req.session.data.SelectedRouteIds = routes;

        const anySelected = routes.length > 0;

        if (!anySelected) {

            if (!errors.HasErrors && req.session.data.courseOptionsIncluded) {
                errors['page'] = {
                    "text": "Select at least one option that reflects what you are finding difficult",
                    "href": "#not-sure-what-do-after-college-sixth-form"
                };
                errors.HasErrors = true;
            }

            if (!errors.HasErrors && req.session.data.gcseOptionsIncluded) {
                errors['page'] = {
                    "text": "Select at least one option that reflects what you are finding difficult",
                    "href": "#maths"
                };
                errors.HasErrors = true;
            }

            if (!errors.HasErrors && req.session.data.jobsOptionsIncluded) {
                errors['page'] = {
                    "text": "Select at least one option that reflects what you are finding difficult",
                    "href": "#do-hear-applications"
                };
                errors.HasErrors = true;
            }

            if (!errors.HasErrors && req.session.data.cvOptionsIncluded) {
                errors['page'] = {
                    "text": "Select at least one option that reflects what you are finding difficult",
                    "href": "#Create-CV-better"
                };
                errors.HasErrors = true;
            }

            return res.render('/round4-mvp/what-help-dynamic', { errors: errors });
        }

        updateStepReached(req, steps.what_help_dynamic);

        const redirectTo = resolvePostRedirect(req, '/round4-mvp/where-are-you-at-with-education');
        return res.redirect(redirectTo);
    });

    // ----------------------------------------------------------------------------------------------------------------
    // where-are-you-at-with-education
    // ----------------------------------------------------------------------------------------------------------------

    router.get('/round4-mvp/where-are-you-at-with-education', navigationValidation(steps.where_are_you_at_with_education), (req, res) => {


        return res.render('/round4-mvp/where-are-you-at-with-education');
    });

    router.post('/round4-mvp/where-are-you-at-with-education', navigationValidation(steps.where_are_you_at_with_education), (req, res) => {

        const errors = {};

        if (!(req.session?.data?.educationStatus) || req.session.data.educationStatus.length == 0) {
            errors['page'] = {
                "text": "Select at least one option that reflects where are you at with education",
                "href": "#education-status-1"
            };
        }

        errors.HasErrors = Object.keys(errors).length > 0;

        if (errors.HasErrors) {
            return res.render('/round4-mvp/where-are-you-at-with-education', { errors: errors });
        }

        updateStepReached(req, steps.where_are_you_at_with_education);
        return res.redirect('/round4-mvp/check-your-answers');
    });

    // ----------------------------------------------------------------------------------------------------------------
    // check-your-answers
    // ----------------------------------------------------------------------------------------------------------------

    router.get('/round4-mvp/check-your-answers', navigationValidation(steps.check_your_answers), (req, res) => {
        updateStepReached(req, steps.check_your_answers);
        return res.render('/round4-mvp/check-your-answers');
    });

    // ----------------------------------------------------------------------------------------------------------------
    // What-you-can-do-next?
    // ----------------------------------------------------------------------------------------------------------------

    router.get('/round4-mvp/What-you-can-do-next', navigationValidation(steps.what_you_can_do_next), (req, res) => {
        res.locals.showAllGuides = typeof req.query["all"] !== 'undefined';

        updateStepReached(req, steps.what_you_can_do_next);
        return res.render('round4-mvp/What-you-can-do-next');
    });

    module.exports = {
        path: '/round4-mvp',
        router
    };

    return router;
}
