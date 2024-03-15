/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const { fileUpload } = require('../middlewares/multer');
const verifyToken = require('../middlewares/verify-token');

// controllers
const eventController = require('../controllers/EventController');

/* -------------------------------------------------------------------------- */
/*                                 Event Route                                */
/* -------------------------------------------------------------------------- */

// POST request - create a new event
router.post('/event', fileUpload, verifyToken, eventController.createEvent);

// GET request - get all events
router.get('/events', eventController.getAllEvents);

// GET request - get a single event
router.get('/events/:id', eventController.getEventById);

// PUT request - Update a single event
router.put('/events/:id', fileUpload, verifyToken, eventController.updateEvent);

// DELETE request - delete a single event
router.delete('/events/:id', verifyToken, eventController.deleteEvent);

module.exports = router;
