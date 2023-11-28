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

//API call for chest workouts

//API call for biceps workouts

//API call for glutes workouts

//API call for middle back workouts

//API call for ab workouts

//Users workout notes are saved when they input them

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
