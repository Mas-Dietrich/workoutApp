const express = require("express");
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("client"));

// API call for inspirational quotes
app.get("/quotes", (req, res) => {
    let options = {
      method: "GET",
      headers: { "x-api-key": "2LP0z26UuHCOic1ZWZ/x5w==7WiMg5Quumm85tl6" },
    };
  
    let url = "https://api.api-ninjas.com/v1/quotes?category=inspirational";
  
    fetch(url, options)
      .then((res) => res.json()) // parse response as JSON
      .then((data) => {
        // Log the entire data object to inspect its structure
        console.log("Full data:", data);
  
        // Accessing the quote and author based on the actual structure
        const quote = data?.[0]?.quote; // Replace "content" with the actual property name for the quote
        const author = data?.[0]?.author; // Replace "author" with the actual property name for the author
  
        console.log("Quote:", quote);
        console.log("Author:", author);
  
        // Send the quote and author in the response
        res.json({ quote, author });
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

//Store completed workout days

let workouts = [
    //Monday
    {
        day: "monday",
        exercises: [
            { exercise: "Bench Press", weight: 125, reps: 12, sets: 3},
            {exercise: "Barbell Press", weight: 75, reps: 12, sets: 4},
        ],
        completed: true,
        rest: false,
    },

    //Tuesday
    {
        day: "tuesday",
        exercises:  [
            {exercise: "Squats", weight: 150, reps: 10, sets: 4},
            {exercise: "Leg Press", weight: 200, reps: 12, sets: 3},
        ],
        completed: false,
        rest: false,
    },

    //Wednesday
    {
        day: "wednesday",
        exercises: [],
        completed: false,
        rest: true,
    },

    //Thursday
    {
        day: "thursday",
        exercises: [],
        completed: false,
        rest: false,
    },

    //Friday
    {
        day: "friday",
        exercises: [],
        completed: false,
        rest: false,
    },

    //Saturday
    {
        day: "saturday",
        exercises: [],
        completed: false,
        rest: false,
    },

    //Sunday
    {
        day: "sunday",
        exercises: [],
        completed: false,
        rest: true,
    },
    
]

//route to GET workout data
app.get('/workouts', (req, res) => {
    res.json(workouts)
})

//route for updating workout data for a specific day
app.put('/workouts/:day', (req, res) => {
    const day = req.params.day.toLowerCase();
    const {exercises, completed, rest} = req.body

    const dayIndex = workouts.findIndex((workout) => workout.day === day)

    if (dayIndex !== -1) {
        // Update exercises, completed status, and rest day status
        workouts[dayIndex].exercises = exercises || [];
        workouts[dayIndex].completed = completed !== undefined ? completed : false;
        workouts[dayIndex].rest = rest !== undefined ? rest : false;

        res.json({success: true, message: `Workout for ${day} updated successfully`});
    } else {
        req.status(404).json({success: false, message: `Workout for ${day} not found.`})
    }
})

//API call for chest workouts

//API call for biceps workouts

//API call for glutes workouts

//API call for middle back workouts

//API call for ab workouts

//Users workout notes are saved when they input them

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
