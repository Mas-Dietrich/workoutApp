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
        notes: [],
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
        notes: [],
    },

    //Wednesday
    {
        day: "wednesday",
        exercises: [],
        completed: false,
        rest: true,
        notes: [],
    },

    //Thursday
    {
        day: "thursday",
        exercises: [],
        completed: false,
        rest: false,
        notes: [],
    },

    //Friday
    {
        day: "friday",
        exercises: [],
        completed: false,
        rest: false,
        notes: [],
    },

    //Saturday
    {
        day: "saturday",
        exercises: [],
        completed: false,
        rest: false,
        notes: [],
    },

    //Sunday
    {
        day: "sunday",
        exercises: [],
        completed: false,
        rest: true,
        notes: [],
    },
    
]

//route to GET workout data
app.get('/workouts', (req, res) => {
    res.json(workouts)
})

//route for updating workout data for a specific day
app.put('/workouts/:day', (req, res) => {
    const day = req.params.day.toLowerCase();
    const {exercises, completed, rest, notes} = req.body

    const dayIndex = workouts.findIndex((workout) => workout.day === day)

    if (dayIndex !== -1) {
        // Update exercises, completed status, and rest day status
        workouts[dayIndex].exercises = exercises || [];
        workouts[dayIndex].completed = completed !== undefined ? completed : false;
        workouts[dayIndex].rest = rest !== undefined ? rest : false;
        workouts[dayIndex].notes = notes || [];

        res.json({success: true, message: `Workout for ${day} updated successfully`});
    } else {
        req.status(404).json({success: false, message: `Workout for ${day} not found.`})
    }
})

//API Call for exercises for users to add to workout plan
app.get('/exercises', async(req, res) => {
    const muscle = req.query.muscle;

    if (!muscle) {
        return res.status(400).json({error: "Muscle parameter is required"})
    }
    const options = {
        method: "GET",
        headers: {"x-api-key": "2LP0z26UuHCOic1ZWZ/x5w==7WiMg5Quumm85tl6"},
    }
    const url = `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log("Exercise Data:", data)

        res.json(data);
    } catch(error) {
        console.log(`Error: ${Error}`);
        res.status(500).json({error: "Internal Server Error"})
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

  //TODO: Need to have a dedicated DELETE ENDPOINT for application