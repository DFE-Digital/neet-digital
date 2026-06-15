const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// ----------------------------
// Page 1: What do you need help with
// ----------------------------
router.post('/needsDifficultyPage', (req, res) => {
  const routes = req.session.data.route || []

  // Always treat as array
  const selected = Array.isArray(routes) ? routes : [routes]

  // Group checks
  const hasCourse = selected.includes('route1') || selected.includes('route2')
  const hasJobs = selected.includes('route3') || selected.includes('route4')

  // ✅ ALL selected (mix of both groups)
  if (hasCourse && hasJobs) {
    return res.redirect('/round4-mvp/what-help-dynamic3')
  }

  // ✅ Only route1/route2
  if (hasCourse) {
    return res.redirect('/round4-mvp/what-help-dynamic1')
  }

  // ✅ Only route3/route4
  if (hasJobs) {
    return res.redirect('/round4-mvp/what-help-dynamic2')
  }

  // fallback
  res.redirect('/round4-mvp/what-help')
})


// ----------------------------
// Page 2a (course / GCSE)
// ----------------------------
router.post('/what-help-dynamic1', (req, res) => {
  const routes = req.session.data.SelectedRouteIds || []
  const selected = Array.isArray(routes) ? routes : [routes]

  if (selected.length > 0) {
    return res.redirect('/round4-mvp/check-your-answers')
  }

  res.redirect('/round4-mvp/what-help-dynamic1')
})


// ----------------------------
// Page 2b (jobs / CV)
// ----------------------------
router.post('/what-help-dynamic2', (req, res) => {
  const routes = req.session.data.SelectedRouteIds || []
  const selected = Array.isArray(routes) ? routes : [routes]

  if (selected.length > 0) {
    return res.redirect('/round4-mvp/check-your-answers')
  }

  res.redirect('/round4-mvp/what-help-dynamic2')
})


// ----------------------------
// Page 2c (combined)
// ----------------------------
router.post('/what-help-dynamic3', (req, res) => {
  const routes = req.session.data.SelectedRouteIds || []
  const selected = Array.isArray(routes) ? routes : [routes]

  if (selected.length > 0) {
    return res.redirect('/round4-mvp/check-your-answers')
  }

  res.redirect('/round4-mvp/what-help-dynamic3')
})


// ----------------------------
// Check your answers
// ----------------------------
router.post('/round4-mvp/check-your-answers', (req, res) => {
  res.redirect('/round4-mvp/check-your-answers')
})


// ----------------------------
// Next steps
// ----------------------------
router.post('/round4-mvp/what-you-can-do-next', (req, res) => {
  res.redirect('/round4-mvp/what-you-can-do-next')
})