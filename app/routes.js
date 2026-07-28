const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

const version = 'exam-results';
const base = `/${version}`;

router.use((req, res, next) => {
    res.locals.req = req;
    res.locals.baseUrl = base;
    next();
});

// ----------------------------------------------------------------------------------------------------------------
// Step Validation
// ----------------------------------------------------------------------------------------------------------------

const steps = Object.freeze({
    landing_page: 0,
    whats_your_first_name: 1,
    current_situation: 2,
    what_help: 3,
    where_are_you_at_with_education: 4,
    check_your_answers: 5,
    what_you_can_do_next: 6
});

function getStepNameByValue(value) {
    for (const [name, val] of Object.entries(steps)) {
        if (val === value) {
            return name;
        }
    }
    return null;
}

function updateStepReached(req, step) {
    if (!req.session.data.stepReached) {
        req.session.data.stepReached = 0;
    }
    req.session.data.stepReached = Math.max(req.session.data.stepReached, step);
}

function resetStepReached(req, step) {
    req.session.data.stepReached = step;
}

function canProceedToStep(req, step) {
    if (!req.session.data.stepReached) {
        req.session.data.stepReached = 0;
    }

    return (step <= (req.session.data.stepReached + 1));
}

// ----------------------------------------------------------------------------------------------------------------
// Cookie management cookieConsentGiven
// ----------------------------------------------------------------------------------------------------------------

// function cookieConsentGiven(req) {
//     const analyticsConsent = req.session && req.session.data && req.session.data.analyticsConsent;
//     return (analyticsConsent === 'yes');
// }

router.get(`${base}/accept-cookies`, function (req, res) {
    req.session.data.analyticsConsent = 'yes';
    res.redirect('back');
});

router.get(`${base}/reject-cookies`, function (req, res) {
    res.redirect(`back`);
});

router.post(`${base}/cookies`, function (req, res) {
    req.session.data.analyticsConsent = req.body.analyticsConsent;
    res.redirect(`${base}/landing-page`);
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
        
        let stepName = getStepNameByValue(req.session.data.stepReached + 1);
        const redirectUrl = stepName ? `${base}/${stepName.replace(/_/g, '-')}` : `${base}/landing-page`;

        return res.redirect(redirectUrl);
    };
}

// ----------------------------------------------------------------------------------------------------------------
// Whats your first name
// ----------------------------------------------------------------------------------------------------------------

router.get(`${base}/whats-your-first-name`, navigationValidation(steps.whats_your_first_name), (req, res) => {
     return res.render(`${base}/whats-your-first-name`);
});

router.post(`${base}/whats-your-first-name`, navigationValidation(steps.whats_your_first_name), (req, res) => {
    updateStepReached(req, steps.whats_your_first_name);
    return res.redirect(`${base}/current-situation`);
});

// ----------------------------------------------------------------------------------------------------------------
// Current situation 
// ----------------------------------------------------------------------------------------------------------------

router.get(`${base}/current-situation`, navigationValidation(steps.current_situation), (req, res) => {
    return res.render(`${base}/current-situation`);
});

router.post(`${base}/current-situation`, navigationValidation(steps.current_situation), (req, res) => {

    const errors = {};

    if (!(req.session?.data?.feeling) || req.session.data.feeling.length == 0) {
        errors['page'] = {
            "text": "Select at least one option that reflects how you’re doing, or select 'I do not want to say how I’m feeling today",
            "href": "#feeling"
        };
    }

    errors.HasErrors = Object.keys(errors).length > 0;

    if (errors.HasErrors) {
        resetStepReached(req, steps.current_situation - 1); // allow user to go back to this step if they have errors
        return res.render(`${base}/current-situation`, { errors: errors });
    }

    updateStepReached(req, steps.current_situation);
    return res.redirect(`${base}/what-help`);
});

// ----------------------------------------------------------------------------------------------------------------
// What help 
// ----------------------------------------------------------------------------------------------------------------

router.get(`${base}/what-help`, navigationValidation(steps.what_help), (req, res) => {
    return res.render(`${base}/what-help`);
});

router.post(`${base}/what-help`, navigationValidation(steps.what_help), (req, res) => { 

    const errors = {};
    errors.HasErrors = false;

    let d = req.session.data;
    const routes = [].concat(d["course-checkbox"]).concat(d["gcse-checkbox"])
                     .concat(d["jobs-checkbox"]).concat(d["cv-checkbox"])
                     .concat(d["route"])
                     .filter(item => typeof item !== 'undefined');
    req.session.data.SelectedRouteIds = routes;

    const anySelected = routes.length > 0;
 
    if (anySelected){
        updateStepReached(req, steps.what_help);
        return res.redirect(`${base}/where-are-you-at-with-education`);
    }

    errors['page'] = {
            "text": "Select at least one option that reflects what you are finding difficult",
             "href": "#route-1"
    };
    errors.HasErrors = true;

   resetStepReached(req, steps.what_help - 1); 
   return res.render(`${base}/what-help`, { errors: errors });
});

// ----------------------------------------------------------------------------------------------------------------
// where-are-you-at-with-education
// ----------------------------------------------------------------------------------------------------------------

router.get(`${base}/where-are-you-at-with-education`, navigationValidation(steps.where_are_you_at_with_education), (req, res) => {


    return res.render(`${base}/where-are-you-at-with-education`);
});

router.post(`${base}/where-are-you-at-with-education`, navigationValidation(steps.where_are_you_at_with_education), (req, res) => {
  
    const errors = {};
    
    if (!(req.session?.data?.educationStatus) || req.session.data.educationStatus.length == 0) {
        errors['page'] = {
            "text": "Select at least one option that reflects where are you at with education",
            "href": "#education-status-1"
        };
    }

    errors.HasErrors = Object.keys(errors).length > 0;

    if (errors.HasErrors) {
        resetStepReached(req, steps.where_are_you_at_with_education - 1); 
        return res.render(`${base}/where-are-you-at-with-education`, { errors: errors });
    }

    updateStepReached(req, steps.where_are_you_at_with_education);
    return res.redirect(`${base}/check-your-answers`);
});

// ----------------------------------------------------------------------------------------------------------------
// check-your-answers
// ----------------------------------------------------------------------------------------------------------------

router.get(`${base}/check-your-answers`, navigationValidation(steps.check_your_answers), (req, res) => {
    updateStepReached(req, steps.check_your_answers);
    return res.render(`${base}/check-your-answers`);
});

// ----------------------------------------------------------------------------------------------------------------
// What-you-can-do-next?
// ----------------------------------------------------------------------------------------------------------------

router.get(`${base}/What-you-can-do-next`, navigationValidation(steps.what_you_can_do_next), (req, res) => {
    updateStepReached(req, steps.what_you_can_do_next);
    return res.render(`${base}/What-you-can-do-next`);
});


/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////------------------ EXAM RESULTS START ------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////




// ----------------------------------------------------------------------------------------------------------------
// What help 
// ----------------------------------------------------------------------------------------------------------------

router.get(`${base}/what-help`, navigationValidation(steps.what_help), (req, res) => {
    return res.render(`${base}/what-help`);
});

// router.post(`${base}/what-help`, navigationValidation(steps.what_help), (req, res) => {

//     const errors = {};

//     if (!(req.session?.data?.route) || req.session.data.route.length == 0) {
//         errors['page'] = {
//             "text": "Select at least one option that reflects what you need help with",
//             "href": "#route-1"
//         };
//     }

//     errors.HasErrors = Object.keys(errors).length > 0;

//     if (errors.HasErrors) {
//         return res.render('/round4-mvp/what-help', { errors: errors });
//     }

//     const valueDislikeCourse        = "I do not like my course and I’m not sure what to do when I finish" ;
//     const valuePassingResit         = "I need to pass my GCSE maths or English resit" ;
//     const valueJobsOrApprenticeship = "I'm stuck applying for jobs or apprenticeships" ; // previous Applying for jobs or get an apprenticeship
//     const valueCVorWork             = "I need help with my CV or getting work experience" ; // previous Help with my CV or get work experience

//     if (!req.session.data.route.includes(valueDislikeCourse)) {
//         req.session.data['course-checkbox'] =  [];
//     }

//     if (!req.session.data.route.includes(valuePassingResit)) {
//         req.session.data['gcse-checkbox'] =  [];
//     }

//     if (!req.session.data.route.includes(valueJobsOrApprenticeship)) {
//         req.session.data['jobs-checkbox'] =  [];
//     }

//     if (!req.session.data.route.includes(valueCVorWork)) {
//         req.session.data['cv-checkbox'] =  [];
//     }

//     updateStepReached(req, steps.what_help);
//     return res.redirect('/round4-mvp/what-help-dynamic');
// });

// // ----------------------------------------------------------------------------------------------------------------
// // What help dynamic
// // ----------------------------------------------------------------------------------------------------------------

// router.get('/round4-mvp/what-help-dynamic', navigationValidation(steps.what_help_dynamic), (req, res) => {
//     return res.render('/round4-mvp/what-help-dynamic');
// });

// router.post('/round4-mvp/what-help-dynamic', navigationValidation(steps.what_help_dynamic), (req, res) => { 



//     const errors = {};
//     errors.HasErrors = false;

//      // const anySelected =
//      //   (
//      //        ((req.session.data.courseOptionsIncluded ?? false) && (req.session.data["course-checkbox"]?.length > 0 ?? false)) ||
//      //        ((req.session.data.gcseOptionsIncluded ?? false) && (req.session.data["gcse-checkbox"]?.length > 0 ?? false)) ||
//      //        ((req.session.data.jobsOptionsIncluded ?? false) && (req.session.data["jobs-checkbox"]?.length > 0 ?? false)) ||
//      //        ((req.session.data.cvOptionsIncluded ?? false) && (req.session.data["cv-checkbox"]?.length > 0 ?? false))
//     //    );


//     let d = req.session.data;
//     const routes = [].concat(d["course-checkbox"]).concat(d["gcse-checkbox"])
//                      .concat(d["jobs-checkbox"]).concat(d["cv-checkbox"])
//                      .filter(item => typeof item !== 'undefined');
//     req.session.data.SelectedRouteIds = routes;

//     const anySelected = routes.length > 0;
 
//     if (anySelected){
//         updateStepReached(req, steps.what_help_dynamic);
//         return res.redirect('/round4-mvp/where-are-you-at-with-education');
//     }

//     if (!errors.HasErrors && req.session.data.courseOptionsIncluded ) {
//         errors['page'] = {
//                 "text": "Select at least one option that reflects what you are finding difficult",
//                 "href": "#not-sure-what-do-after-college-sixth-form"
//         };
//         errors.HasErrors = true;
//     }

//     if (!errors.HasErrors && req.session.data.gcseOptionsIncluded) {
//         errors['page'] = {
//             "text": "Select at least one option that reflects what you are finding difficult",
//             "href": "#maths"
//         };
//           errors.HasErrors = true;
//     }

//     if (!errors.HasErrors && req.session.data.jobsOptionsIncluded) {
//         errors['page'] = {
//              "text": "Select at least one option that reflects what you are finding difficult",
//              "href": "#do-hear-applications"
//         };
//         errors.HasErrors = true;
//     }

//     if (!errors.HasErrors && req.session.data.cvOptionsIncluded) {
//         errors['page'] = {
//              "text": "Select at least one option that reflects what you are finding difficult",
//              "href": "#Create-CV-better"
//         };
//         errors.HasErrors = true;
//     }

//     return res.render('/round4-mvp/what-help-dynamic', { errors: errors });
// });

// // ----------------------------------------------------------------------------------------------------------------
// // where-are-you-at-with-education
// // ----------------------------------------------------------------------------------------------------------------

// router.get('/round4-mvp/where-are-you-at-with-education', navigationValidation(steps.where_are_you_at_with_education), (req, res) => {


//     return res.render('/round4-mvp/where-are-you-at-with-education');
// });

// router.post('/round4-mvp/where-are-you-at-with-education', navigationValidation(steps.where_are_you_at_with_education), (req, res) => {
  
//     const errors = {};
    
//     if (!(req.session?.data?.educationStatus) || req.session.data.educationStatus.length == 0) {
//         errors['page'] = {
//             "text": "Select at least one option that reflects where are you at with education",
//             "href": "#education-status-1"
//         };
//     }

//     errors.HasErrors = Object.keys(errors).length > 0;

//     if (errors.HasErrors) {
//         return res.render('/round4-mvp/where-are-you-at-with-education', { errors: errors });
//     }

//     updateStepReached(req, steps.where_are_you_at_with_education);
//     return res.redirect('/round4-mvp/check-your-answers');
// });



/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////------------------- EXAM RESULTS END -------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////




// ----------------------------------------------------------------------------------------------------------------
// What help 
// ----------------------------------------------------------------------------------------------------------------

router.get('/exam-results/what-help', navigationValidation(steps.what_help), (req, res) => {
    return res.render('/exam-results/what-help');
});

router.post('/exam-results/what-help', navigationValidation(steps.what_help), (req, res) => {

    const errors = {};

    if (!(req.session?.data?.route) || req.session.data.route.length == 0) {
        errors['page'] = {
            "text": "Select at least one option that reflects what you need help with",
            "href": "#route-1"
        };
    }

    errors.HasErrors = Object.keys(errors).length > 0;

    if (errors.HasErrors) {
        return res.render('/exam-results/what-help', { errors: errors });
    }

    const valueDislikeCourse        = "I do not like my course and I’m not sure what to do when I finish" ;
    const valuePassingResit         = "I need to pass my GCSE maths or English resit" ;
    const valueJobsOrApprenticeship = "I'm stuck applying for jobs or apprenticeships" ; // previous Applying for jobs or get an apprenticeship
    const valueCVorWork             = "I need help with my CV or getting work experience" ; // previous Help with my CV or get work experience

    if (!req.session.data.route.includes(valueDislikeCourse)) {
        req.session.data['course-checkbox'] =  [];
    }

    if (!req.session.data.route.includes(valuePassingResit)) {
        req.session.data['gcse-checkbox'] =  [];
    }

    if (!req.session.data.route.includes(valueJobsOrApprenticeship)) {
        req.session.data['jobs-checkbox'] =  [];
    }

    if (!req.session.data.route.includes(valueCVorWork)) {
        req.session.data['cv-checkbox'] =  [];
    }

    updateStepReached(req, steps.what_help);
    return res.redirect('/exam-results/what-help');
});

// ----------------------------------------------------------------------------------------------------------------
// What help dynamic
// ----------------------------------------------------------------------------------------------------------------

// router.get('/exam-results/what-help-dynamic', navigationValidation(steps.what_help_dynamic), (req, res) => {
//     return res.render('/exam-results/what-help-dynamic');
// });

// router.post('/exam-results/what-help-dynamic', navigationValidation(steps.what_help_dynamic), (req, res) => { 



//     const errors = {};
//     errors.HasErrors = false;

//      // const anySelected =
//      //   (
//      //        ((req.session.data.courseOptionsIncluded ?? false) && (req.session.data["course-checkbox"]?.length > 0 ?? false)) ||
//      //        ((req.session.data.gcseOptionsIncluded ?? false) && (req.session.data["gcse-checkbox"]?.length > 0 ?? false)) ||
//      //        ((req.session.data.jobsOptionsIncluded ?? false) && (req.session.data["jobs-checkbox"]?.length > 0 ?? false)) ||
//      //        ((req.session.data.cvOptionsIncluded ?? false) && (req.session.data["cv-checkbox"]?.length > 0 ?? false))
//     //    );


//     let d = req.session.data;
//     const routes = [].concat(d["course-checkbox"]).concat(d["gcse-checkbox"])
//                      .concat(d["jobs-checkbox"]).concat(d["cv-checkbox"])
//                      .filter(item => typeof item !== 'undefined');
//     req.session.data.SelectedRouteIds = routes;

//     const anySelected = routes.length > 0;
 
//     if (anySelected){
//         updateStepReached(req, steps.what_help_dynamic);
//         return res.redirect('/exam-results/where-are-you-at-with-education');
//     }

//     if (!errors.HasErrors && req.session.data.courseOptionsIncluded ) {
//         errors['page'] = {
//                 "text": "Select at least one option that reflects what you are finding difficult",
//                 "href": "#not-sure-what-do-after-college-sixth-form"
//         };
//         errors.HasErrors = true;
//     }

//     if (!errors.HasErrors && req.session.data.gcseOptionsIncluded) {
//         errors['page'] = {
//             "text": "Select at least one option that reflects what you are finding difficult",
//             "href": "#maths"
//         };
//           errors.HasErrors = true;
//     }

//     if (!errors.HasErrors && req.session.data.jobsOptionsIncluded) {
//         errors['page'] = {
//              "text": "Select at least one option that reflects what you are finding difficult",
//              "href": "#do-hear-applications"
//         };
//         errors.HasErrors = true;
//     }

//     if (!errors.HasErrors && req.session.data.cvOptionsIncluded) {
//         errors['page'] = {
//              "text": "Select at least one option that reflects what you are finding difficult",
//              "href": "#Create-CV-better"
//         };
//         errors.HasErrors = true;
//     }

//     return res.render('/exam-results/what-help-dynamic', { errors: errors });
// });

// ----------------------------------------------------------------------------------------------------------------
// where-are-you-at-with-education
// ----------------------------------------------------------------------------------------------------------------

router.get('/exam-results/where-are-you-at-with-education', navigationValidation(steps.where_are_you_at_with_education), (req, res) => {


    return res.render('/exam-results/where-are-you-at-with-education');
});

router.post('/exam-results/where-are-you-at-with-education', navigationValidation(steps.where_are_you_at_with_education), (req, res) => {
  
    const errors = {};
    
    if (!(req.session?.data?.educationStatus) || req.session.data.educationStatus.length == 0) {
        errors['page'] = {
            "text": "Select at least one option that reflects where are you at with education",
            "href": "#education-status-1"
        };
    }

    errors.HasErrors = Object.keys(errors).length > 0;

    if (errors.HasErrors) {
        return res.render('/exam-results/where-are-you-at-with-education', { errors: errors });
    }

    updateStepReached(req, steps.where_are_you_at_with_education);
    return res.redirect('/exam-results/check-your-answers');
});



/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////------------------- EXAM RESULTS END -------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////
/////////////////////////////////--------------------------------------------------------/////////////////////////////////



