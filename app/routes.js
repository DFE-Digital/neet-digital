const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()


// ----------------------------
// GET: dynamic rendering page
// ----------------------------
router.get('/what-help-dynamic', (req, res) => {

  const route = req.query.route

  req.session.data.route = route

  res.render('round4-mvp/what-help-dynamic', {
    data: req.session.data
  })
})

module.exports = router


// ERROR MESSAGES START




// ====================================================
// What's your first name? (optional)
// ====================================================


router.post('/round4-mvp-error-messages/current-situation', function (req, res) {
  const firstName = req.body.firstName;

  let errors = {};

  // Validation
  if (!firstName || firstName.trim() === '') {
    errors.firstName = "Enter your first name";
  }

  if (Object.keys(errors).length > 0) {
    res.render('round4-mvp-error-messages/whats-your-first-name', {
      errors: errors,
      data: req.body
    });
  } else {
    res.redirect('/round4-mvp-error-messages/current-situation');
  }
}) 



// ====================================================
// WHAT HELP PAGE
// ====================================================

// Show page
router.get('/round4-mvp-error-messages/what-help', (req, res) => {
  res.render('round4-mvp-error-messages/what-help')
})

// Validate choices
router.get('/round4-mvp-error-messages/what-help-dynamic2', (req, res) => {

  const route = req.query.route

  if (!route) {
    return res.render('round4-mvp-error-messages/what-help', {
      errors: {
        route: 'Select what you need help with'
      }
    })
  }

  // Save selected routes in session
  req.session.data.route = route

  res.render('round4-mvp-error-messages/what-help-dynamic2', {
    data: req.session.data
  })
})


// ====================================================
// WHAT HELP DYNAMIC PAGE
// ====================================================

router.post('/what-help-dynamic3', (req, res) => {

  const selected = req.body.SelectedRouteIds

  // Save answers so checked() works
  req.session.data.SelectedRouteIds = selected

  if (!selected) {
    return res.render('round4-mvp-error-messages/what-help-dynamic2', {
      errors: {
        SelectedRouteIds: 'Select what you are finding difficult'
      },
      data: req.session.data
    })
  }

  res.redirect('/next-page')
})

module.exports = router


