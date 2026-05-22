//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

router.post('/current-situation', (req, res) => {
  res.redirect('/current-situation')
})

router.post('/what-do-you-need-to-do', (req, res) => {
  res.redirect('/what-do-you-need-to-do')
})

router.post('/where-are-you-at-with-education', (req, res) => {
  const task = req.session.data.task
  const jobTasks = ['Apply for jobs', 'Get work experience', 'Create a CV or make my CV better']
  const collegeTasks = [
    'Switch to a different course',
    'Understand how my course can help me get to my goal',
    'Pass my GCSE maths or English resit',
    'Work out what to do as I want to drop out',
    'I dropped out but plan to join a course next year'
  ]

  const hasJobTask = Array.isArray(task)
    ? task.some(t => jobTasks.includes(t))
    : jobTasks.includes(task)

  const hasApprenticeship = Array.isArray(task)
    ? task.includes('Get an apprenticeship')
    : task === 'Get an apprenticeship'

  const hasCollegeTask = Array.isArray(task)
    ? task.some(t => collegeTasks.includes(t))
    : collegeTasks.includes(task)

  if (hasCollegeTask && (hasJobTask || hasApprenticeship)) {
    res.redirect('/what-are-you-finding-difficult')
  } else if (hasJobTask && hasApprenticeship) {
    res.redirect('/which-parts-of-job-or-apps-do-you-need-help-with')
  } else if (hasJobTask) {
    res.redirect('/which-parts-of-job-do-you-need-help-with')
  } else if (hasApprenticeship) {
    res.redirect('/which-parts-of-apprenticeship-do-you-need-help-with')
  } else {
    res.redirect('/where-are-you-at-with-education')
  }
})

router.post('/which-parts-of-college-do-you-need-help-with', (req, res) => {
  const educationStatus = req.session.data.educationStatus
  const collegeStatuses = ['college', 'sixth form', 'sixth form college']

  const hsPruStatuses = ['homeschooling', 'being in a pupil referral unit (PRU)']

  if (collegeStatuses.includes(educationStatus)) {
    res.redirect('/which-parts-of-college-or-sixthform-do-you-need-help-with')
  } else if (hsPruStatuses.includes(educationStatus)) {
    res.redirect('/which-parts-of-hs-or-pru-do-you-need-help-with')
  } else {
    res.redirect('/check-your-answers')
  }
})

router.post('/which-parts-of-college-or-sixthform-do-you-need-help-with', (req, res) => {
  res.redirect('/check-your-answers')
})

router.post('/check-your-answers', (req, res) => {
  res.redirect('/check-your-answers')
})

router.post('/What-you-can-do-next', (req, res) => {
  res.redirect('/What-you-can-do-next')
})
