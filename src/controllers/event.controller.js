/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const fs = require('fs');
const { default: mongoose } = require('mongoose');

// Models
const Event = require('../models/event.model');

// helpers
const { getfilteredArrayOfObject, firebaseAdmin } = require('../utils/helpers');

/* -------------------------------------------------------------------------- */
/*                              Events Controller                             */
/* -------------------------------------------------------------------------- */

/**
 * Create a new event
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const createEvent = async (req, res) => {
  let newEvent = new Event();
  // in common
  newEvent.gallery =
    req.files?.gallery === undefined
      ? []
      : req.files?.gallery.map((g) => g.path.replace('\\', '/'));
  newEvent.photo =
    req.files?.photo === undefined
      ? ''
      : (req.files?.photo[0].path).replace('\\', '/');
  newEvent.link = req.body.link;
  newEvent.isEvent = req.body.isEvent;
  newEvent.start_at = req.body.start_at;
  newEvent.end_at = req.body.end_at;
  newEvent.coordinates.latitude = req.body.latitude;
  newEvent.coordinates.longitude = req.body.longitude;
  newEvent.createdAt = new Date();
  // for arabic language
  newEvent.ar.event_name = req.body.event_name_ar;
  newEvent.ar.description = req.body.description_ar;
  newEvent.ar.event_location = req.body.event_location_ar;
  // for french language
  newEvent.fr.event_name = req.body.event_name_fr;
  newEvent.fr.description = req.body.description_fr;
  newEvent.fr.event_location = req.body.event_location_fr;

  await newEvent
    .save()
    .then((data) => {
      // send notificaiton
      var message = {
        notification: {
          title: `${
            data.isEvent === true
              ? 'Un événement a été ajouté'
              : 'Une actualité a été ajoutée'
          }`,
          body: data.fr.event_name,
        },
        // data must only contain string values
        data: {
          type: data.isEvent === true ? 'event' : 'news',
          title: data.fr.event_name,
          body: data.fr.description,
          eventId: `${data._id}`,
        },
        topic: 'event',
      };
      // Send a message to devices subscribed to the provided topic.
      firebaseAdmin
        .messaging()
        .send(message)
        .then((response) => {
          // Response is a message ID string.
          console.log('Notification envoyé avec succès :', response);
        })
        .catch((error) => {
          console.log("Erreur lors de l'envoi de la notification :", error);
        });

      // response
      res.status(200).json({
        status: true,
        message: 'Nouvelle evenement créée avec succès',
        HelpRequest: newEvent,
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
};

/**
 * Retrieves all events
 * @param {Object} res - The response object
 */
const getAllEvents = async (req, res) => {
  try {
    let lang = req.headers.lang;
    // Return events depending on the selected language (arabic or french)
    let events = await Event.aggregate([
      {
        $project:
          lang !== undefined
            ? lang === 'ar'
              ? { fr: 0 }
              : { ar: 0 }
            : { __v: 0 },
      },
    ]).exec();

    const eventsSortByDate = events?.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      events: lang
        ? getfilteredArrayOfObject(eventsSortByDate, lang)
        : eventsSortByDate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves an event by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getEventById = async (req, res) => {
  try {
    let lang = req.headers.lang;

    // Return event depending on the selected language (arabic or french)
    let event = await Event.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      {
        $project:
          lang !== undefined
            ? lang === 'ar'
              ? { fr: 0 }
              : { ar: 0 }
            : { __v: 0 },
      },
    ]).exec();
    res.json({
      success: true,
      event: lang ? getfilteredArrayOfObject(event, lang)[0] : event[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update an event by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateEvent = async (req, res) => {
  try {
    let CurrentEvent = await Event.findOne({ _id: req.params.id });

    const updateImages = {};

    if (req.files?.photo) {
      // delete photo
      // check if we got files object
      if (req.files?.photo !== undefined) {
        // check if the user didn't have photo
        if (CurrentEvent.photo !== '') {
          fs.unlinkSync(`${CurrentEvent.photo}`);
        }
      }
      //  then update
      updateImages.photo = (req.files?.photo[0].path).replace('\\', '/');
    }

    if (req.files?.gallery) {
      // delete gallery
      // check if we got files object
      if (CurrentEvent.gallery != '' || CurrentEvent.gallery.length > 1) {
        // check if the request didn't gallery images
        CurrentEvent.gallery.map((gr) => {
          try {
            try {
              fs.unlinkSync(`${gr}`);
            } catch (error) {
              console.log(error);
            }
          } catch (error) {
            console.log(error);
          }
        });
      }
      //  then update
      updateImages.gallery = req.files?.gallery.map((g) =>
        g.path.replace('\\', '/'),
      );
    }

    let event = await Event.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          // in common
          ...updateImages,
          start_at: req.body.start_at
            ? req.body.start_at
            : CurrentEvent.start_at,
          isEvent: req.body.isEvent ? req.body.isEvent : CurrentEvent.isEvent,
          end_at: req.body.end_at ? req.body.end_at : CurrentEvent.end_at,
          link: req.body.link ?? req.body.link,
          'coordinates.latitude': req.body.latitude
            ? req.body.latitude
            : CurrentEvent.coordinates.latitude,
          'coordinates.longitude': req.body.longitude
            ? req.body.longitude
            : CurrentEvent.coordinates.longitude,
          // for arabic language
          'ar.event_name': req.body.event_name_ar
            ? req.body.event_name_ar
            : CurrentEvent.ar.event_name,
          'ar.description': req.body.description_ar
            ? req.body.description_ar
            : CurrentEvent.ar.description,
          'ar.event_location': req.body.event_location_ar
            ? req.body.event_location_ar
            : CurrentEvent.ar.event_location,
          // for french language
          'fr.event_name': req.body.event_name_fr
            ? req.body.event_name_fr
            : CurrentEvent.fr.event_name,
          'fr.description': req.body.description_fr
            ? req.body.description_fr
            : CurrentEvent.fr.description,
          'fr.event_location': req.body.event_location_fr
            ? req.body.event_location_fr
            : CurrentEvent.fr.event_location,
        },
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "L'article a bien été mis à jour",
      updatedEvent: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete an event by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteEvent = async (req, res) => {
  try {
    let imagesToDelete = await Event.findOne({ _id: req.params.id });
    if (imagesToDelete.photo !== '') {
      fs.unlinkSync(`${imagesToDelete.photo}`);
    }

    // delete gallery
    if (imagesToDelete.gallery != '' || imagesToDelete.gallery > 1) {
      imagesToDelete.gallery.map((gr) => {
        try {
          fs.unlinkSync(`${gr}`);
        } catch (error) {
          console.log(error);
        }
      });
    }

    // Delete Event object
    let deletedEvent = await Event.findOneAndDelete({ _id: req.params.id });

    if (deletedEvent) {
      res.status(200).json({
        status: true,
        message: 'Article supprimé avec succès',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export module
module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
