const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();

// ----------------------------------------------------------------------------------------------------------------
// Whats your first name
// ----------------------------------------------------------------------------------------------------------------

// POST
router.post('/round4-mvp/whats-your-first-name', (req, res) => {
    return res.redirect('/round4-mvp/current-situation');
});

// ----------------------------------------------------------------------------------------------------------------
// Current situation 
// ----------------------------------------------------------------------------------------------------------------

router.post('/round4-mvp/current-situation', (req, res) => {

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
    return res.redirect('/round4-mvp/what-help');
});

// ----------------------------------------------------------------------------------------------------------------
// What help 
// ----------------------------------------------------------------------------------------------------------------

router.post('/round4-mvp/what-help', (req, res) => {

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

    const valueDislikeCourse        = "I do not like my course and I’m not sure what to do when I finish" ;
    const valuePassingResit         = "I need to pass my GCSE maths or English resit" ;
    const valueJobsOrApprenticeship = "Applying for jobs or get an apprenticeship" ;
    const valueCVorWork             = "Help with my CV or get work experience" ;

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

    return res.redirect('/round4-mvp/what-help-dynamic');
});

// ----------------------------------------------------------------------------------------------------------------
// What help dynamic
// ----------------------------------------------------------------------------------------------------------------

router.post('/round4-mvp/what-help-dynamic', (req, res) => { 

/*
// Code for individual checkbox group errors.

    if (Object.keys(errors).length == 0 && req.session.data.courseOptionsIncluded && !req.session.data["course-checkbox"]) {
        errors['course'] = {
            "text": "Select at least one option that reflects what you are finding difficult",
            "href": "#not-sure-what-do-after-college-sixth-form"
        };
    }

    if (Object.keys(errors).length == 0 && req.session.data.gcseOptionsIncluded && !req.session.data["gcse-checkbox"]) {
        errors['gcse'] = {
            "text": "Select at least one option of Maths and English",
            "href": "#maths"
        };
    }

    if (Object.keys(errors).length == 0 && req.session.data.jobsOptionsIncluded && !req.session.data["jobs-checkbox"]) {
        errors['jobs'] = {
            "text": "Select at least one job or apprenticeship option",
            "href": "#do-hear-applications"
        };
    }

    if (Object.keys(errors).length == 0 && req.session.data.cvOptionsIncluded && !req.session.data["cv-checkbox"]) {
        errors['cv'] = {
            "text": "Select at least one option of help with my CV or get work experience",
            "href": "#Create-CV-better"
        };
    }
*/
    const errors = {};
    errors.HasErrors = false;

     const anySelected =
       (
            ((req.session.data.courseOptionsIncluded ?? false) && (req.session.data["course-checkbox"]?.length > 0 ?? false)) ||
            ((req.session.data.gcseOptionsIncluded ?? false) && (req.session.data["gcse-checkbox"]?.length > 0 ?? false)) ||
            ((req.session.data.jobsOptionsIncluded ?? false) && (req.session.data["jobs-checkbox"]?.length > 0 ?? false)) ||
            ((req.session.data.cvOptionsIncluded ?? false) && (req.session.data["cv-checkbox"]?.length > 0 ?? false))
        );

     if (anySelected)
     {
        return res.redirect('/round4-mvp/where-are-you-at-with-education');
     }

    if (!errors.HasErrors && req.session.data.courseOptionsIncluded ) {
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
});

// ----------------------------------------------------------------------------------------------------------------
// where-are-you-at-with-education
// ----------------------------------------------------------------------------------------------------------------

router.post('/round4-mvp/where-are-you-at-with-education', (req, res) => {
  
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
    return res.redirect('/round4-mvp/check-your-answers');
});
