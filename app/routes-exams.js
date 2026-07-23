module.exports = function (router) {

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

    req.session.data.stepReached = Math.max(
      req.session.data.stepReached,
      step
    );
  }

  function canProceedToStep(req, step) {
    if (!req.session.data.stepReached) {
      req.session.data.stepReached = 0;
    }

    return step <= (req.session.data.stepReached + 1);
  }

  // ----------------------------------------------------------------------------------------------------------------
  // Cookie management cookieConsentGiven
  // ----------------------------------------------------------------------------------------------------------------

  function cookieConsentGiven(req) {
    const analyticsConsent =
      req.session &&
      req.session.data &&
      req.session.data.analyticsConsent;

    return analyticsConsent === 'yes';
  }

  router.get('/exam-results/accept-cookies', function (req, res) {
    req.session.data.analyticsConsent = 'yes';
    res.redirect('back');
  });

  router.get('/exam-results/reject-cookies', function (req, res) {
    res.redirect('/exam-results/landing-page');
  });

  router.post('/exam-results/cookies', function (req, res) {
    if (req.body.analyticsConsent === 'yes') {
      req.session.data.analyticsConsent = req.body.analyticsConsent;
    }

    res.redirect('/exam-results/landing-page');
  });

  // ----------------------------------------------------------------------------------------------------------------
  // NavigationValidation
  // ----------------------------------------------------------------------------------------------------------------

  function navigationValidation(step) {
    return function (req, res, next) {
      if (
        cookieConsentGiven(req) &&
        canProceedToStep(req, step)
      ) {
        next();
        return;
      }

      return res.redirect('/exam-results/landing-page');
    };
  }

  // ----------------------------------------------------------------------------------------------------------------
  // Whats your first name
  // ----------------------------------------------------------------------------------------------------------------

  router.get(
    '/exam-results/whats-your-first-name',
    navigationValidation(steps.whats_your_first_name),
    (req, res) => {
      return res.render('/exam-results/whats-your-first-name');
    }
  );

  router.post(
    '/exam-results/whats-your-first-name',
    navigationValidation(steps.whats_your_first_name),
    (req, res) => {
      updateStepReached(req, steps.whats_your_first_name);
      return res.redirect('/exam-results/current-situation');
    }
  );

  // ----------------------------------------------------------------------------------------------------------------
  // Current situation
  // ----------------------------------------------------------------------------------------------------------------

  router.get(
    '/exam-results/current-situation',
    navigationValidation(steps.current_situation),
    (req, res) => {
      return res.render('/exam-results/current-situation');
    }
  );

  router.post(
    '/exam-results/current-situation',
    navigationValidation(steps.current_situation),
    (req, res) => {
      const errors = {};

      if (!(req.session?.data?.feeling) || req.session.data.feeling.length === 0) {
        errors.page = {
          text: "Select at least one option that reflects how you’re doing, or select 'I do not want to say how I’m feeling today'",
          href: '#feeling'
        };
      }

      errors.HasErrors = Object.keys(errors).length > 0;

      if (errors.HasErrors) {
        return res.render('/exam-results/current-situation', {
          errors
        });
      }

      updateStepReached(req, steps.current_situation);
      return res.redirect('/exam-results/what-help');
    }
  );

  // ----------------------------------------------------------------------------------------------------------------
  // ALL THE REST OF YOUR ROUTES STAY HERE
  // ----------------------------------------------------------------------------------------------------------------

  // what-help
  // what-help-dynamic
  // where-are-you-at-with-education
  // check-your-answers
  // what-you-can-do-next

};


