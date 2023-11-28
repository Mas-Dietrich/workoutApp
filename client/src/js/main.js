//Display Inspirational Quote in the banner start
let inspirationalQuote = document.querySelector("#inspirationalQuote");

document.addEventListener('DOMContentLoaded', function () {
    const quoteContainer = document.querySelector('.quote-banner');
  
    // Make a request to the server's /quotes endpoint
    fetch('/quotes')
      .then(response => response.json())
      .then(data => {
        const quote = `${data.quote} -${data.author}`;
  
        inspirationalQuote.textContent = quote;
      })
      .catch(error => {
        console.error('Error fetching quote:', error);
      });
  });
// Display Inspirational Quote in the banner end


//Users can browse and add workouts to a day of the week's workout plan when they click the + button


//Users can toggle whether or not they completed the workout for that day
let completeWorkout = document.querySelector('.completeWorkout')

completeWorkout.addEventListener('click', () => {
    const card = document.querySelector('.card')

    card.classList.toggle('completed')
})

//Users can toggle whether or not a day was a rest day
let restDay = document.querySelector('.restDay')

restDay.addEventListener('click', () => {
    const card = document.querySelector('.card')

    card.classList.toggle('rest')
})

//Progress tracker for days of the week completed out of 7 in the footer that dynamically updates
let progressTracker = document.querySelector('.progress')