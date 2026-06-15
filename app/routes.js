const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// ----------------------------
// Page 1: What do you need help with
// ----------------------------
router.post('/what-help', (req, res) => {
  const routes = req.session.data.route || []

  const selected = Array.isArray(routes) ? routes : [routes]

  const hasCourse = selected.includes(' I do not like my course and I’m not sure what to do when I finish') || selected.includes('I need to pass my GCSE maths or English resit')
  const hasJobs = selected.includes('Applying for jobs or get an apprenticeship') || selected.includes('Help with my CV or get work experience')

  // ✅ ALL selected (mix of both groups)
  if (hasCourse && hasJobs) {
    return res.redirect('/round4-mvp/what-help-dynamic3')
  }

  // ✅ Only  I do not like my course and I’m not sure what to do when I finish/I need to pass my GCSE maths or English resit
  if (hasCourse) {
    return res.redirect('/round4-mvp/what-help-dynamic1')
  }

  // ✅ Only route3/route4 Help with my CV or get work experience
  if (hasJobs) {
    return res.redirect('/round4-mvp/what-help-dynamic2')
  }

  // fallback
  res.redirect('/round4-mvp/what-help')
})


// ----------------------------
// Page what-help-dynamic1
// ----------------------------
router.post('/what-help-dynamic1', (req, res) => {
  const routes = req.session.data.SelectedRouteIds || []
  const selected = Array.isArray(routes) ? routes : [routes]

  if (selected.length > 0) {
    return res.redirect('/round4-mvp/where-are-you-at-with-education')
  }

  res.redirect('/round4-mvp/what-help-dynamic1')
})


// ----------------------------
// Page /what-help-dynamic2
// ----------------------------
router.post('/what-help-dynamic2', (req, res) => {
  const routes = req.session.data.SelectedRouteIds || []
  const selected = Array.isArray(routes) ? routes : [routes]

  if (selected.length > 0) {
    return res.redirect('/round4-mvp/where-are-you-at-with-education')
  }

  res.redirect('/round4-mvp/what-help-dynamic2')
})



// ----------------------------
// Dynamic page 1 - what-help-dynamic1
// ----------------------------
router.post('/what-help-dynamic1', (req, res) => {
  return res.redirect('/round4-mvp/where-are-you-at-with-education')
})

// ----------------------------
// Dynamic page 2 - what-help-dynamic2
// ----------------------------
router.post('/what-help-dynamic2', (req, res) => {
  return res.redirect('/round4-mvp/where-are-you-at-with-education')
})

// ----------------------------
// Dynamic page 3 - what-help-dynamic3
// ----------------------------
router.post('/what-help-dynamic3', (req, res) => {
  return res.redirect('/round4-mvp/where-are-you-at-with-education')
})

