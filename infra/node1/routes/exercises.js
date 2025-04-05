const express = require('express');
const router = express.Router();
const { createExercise, getGroupedExercises, getExercisesWithSubmissions } = require('../controllers/exercisesController');

router.get('/grouped', getGroupedExercises);
router.get('/with-submissions', getExercisesWithSubmissions); 
router.post('/', createExercise);


module.exports = router;
