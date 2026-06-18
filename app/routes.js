const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()


// ----------------------------
// PAGE 1: What do you need help with
// ----------------------------
router.post('/what-help', (req, res) => {

  let routes = req.session.data.route || []
  const selected = Array.isArray(routes) ? routes : [routes]

  const hasCourse =
    selected.includes('I do not like my course and I’m not sure what to do when I finish') ||
    selected.includes('I need to pass my GCSE maths or English resit')

  const hasJobs =
    selected.includes('Applying for jobs or get an apprenticeship') ||
    selected.includes('Help with my CV or get work experience')

  // ✅ ALL selected (mix of both groups)
  if (hasCourse && hasJobs) {
    return res.redirect('/round4-mvp/what-help-dynamic3')
  }

  // ✅ Course-related only
  if (hasCourse) {
    return res.redirect('/round4-mvp/what-help-dynamic1')
  }

  // ✅ Jobs-related only
  if (hasJobs) {
    return res.redirect('/round4-mvp/what-help-dynamic2')
  }

  // fallback
  res.redirect('/round4-mvp/what-help')
})


// ----------------------------
// DYNAMIC PAGE 1
// ----------------------------
router.post('/what-help-dynamic1', (req, res) => {

  const routes = req.body.SelectedRouteIds || []
  const selected = Array.isArray(routes) ? routes : [routes]

  if (selected.length > 0) {
    req.session.data.SelectedRouteIds = selected
    return res.redirect('/round4-mvp/where-are-you-at-with-education')
  }

  res.redirect('/round4-mvp/what-help-dynamic1')
})


// ----------------------------
// DYNAMIC PAGE 2
// ----------------------------
router.post('/what-help-dynamic2', (req, res) => {

  const routes = req.body.SelectedRouteIds || []
  const selected = Array.isArray(routes) ? routes : [routes]

  if (selected.length > 0) {
    req.session.data.SelectedRouteIds = selected
    return res.redirect('/round4-mvp/where-are-you-at-with-education')
  }

  res.redirect('/round4-mvp/what-help-dynamic2')
})


// ----------------------------
// DYNAMIC PAGE 3 (ALL SELECTED)
// ----------------------------
router.post('/what-help-dynamic3', (req, res) => {

  const routes = req.body.SelectedRouteIds || []
  const selected = Array.isArray(routes) ? routes : [routes]

  req.session.data.SelectedRouteIds = selected

  res.redirect('/round4-mvp/where-are-you-at-with-education')
})


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



