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

//Dynamically display workout data from server.js
document.addEventListener("DOMContentLoaded", function() {
    let workouts;

    const workoutTablesContainer = document.getElementById('workoutTables')
    const completedWorkoutsTracker = document.getElementById('completedWorkouts')
    fetch('/workouts')
    .then(response => response.json())
    .then(data => {
        workouts = data;

        workouts.forEach((dayData) => {
            const card = createCard(dayData);
            workoutTablesContainer.appendChild(card)

            //toggle completed status for completed workout days
            if (dayData.completed) {
                card.classList.add('completed')
            }
        })
        completedWorkoutsCount();
    })
    .catch(error => {
        console.error('Error fetching workout data: ', error);
    })

    //Function to dynamically create card for the specific day's workout
    function createCard(dayData) {
        const card = document.createElement('div')
        card.classList.add("card");

        //Workout's day of the week
        const heading = document.createElement('h2')
        heading.textContent = dayData.day.charAt(0).toUpperCase() + dayData.day.slice(1);
        card.appendChild(heading)

        //Workout data table
        const table = createTable(dayData)
        card.appendChild(table)

        //Note taking textarea
        const workoutNotes = document.createElement('textarea')
        workoutNotes.id = "notes";
        workoutNotes.name = "notes";
        workoutNotes.rows = "4";
        workoutNotes.cols = "30";
        workoutNotes.placeholder = "Your Notes Here...";

        card.appendChild(workoutNotes)

        //Complete workout button, rest day button, and add workout button
        const completeButton = createButton("completeWorkout", "check")
        //Event listener for completeButton
        completeButton.addEventListener('click', ()=> toggleCompletedStatus(dayData))
        const restDayButton = createButton("restDay", "bed")
        const addWorkoutButton = createButton("addWorkout", "plus")

        card.appendChild(completeButton)
        card.appendChild(restDayButton)
        card.appendChild(addWorkoutButton)

        return card;

    }

    //function to create Data Table and keep styling from static iteration of app
    function createTable(dayData) {
        const table = document.createElement("table");
        table.classList.add("workout-table");

        const thead = document.createElement("thead");
        const headerRow = document.createElement('tr');
        ['Workout', 'Weight', 'Reps', 'Sets'].forEach((headerText) => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th)
        });
        thead.appendChild(headerRow)
        table.appendChild(thead)

        const tbody = document.createElement('tbody');
        dayData.exercises.forEach((exercise) => {
            const row = document.createElement('tr');
            ['exercise', 'weight', 'reps', 'sets'].forEach((prop) => {
                const td = document.createElement('td')
                td.textContent = exercise[prop];
                row.appendChild(td)
            });
            tbody.appendChild(row)
        });
        table.appendChild(tbody)

        return table;
    }

    //Function to create buttons for the cards
    function createButton(className, iconClass) {
        const button = document.createElement('button');
        button.type = "button";
        button.classList.add(className);
        const icon = document.createElement('i');
        icon.classList.add("fa", `fa-${iconClass}`)
        button.appendChild(icon)

        return button;

    }

    //Function to update number of completed workouts
    function completedWorkoutsCount() {
        const completedWorkouts = workouts.filter(day => day.completed).length;
        completedWorkoutsTracker.textContent = `${completedWorkouts} / 7 Workouts Complete`
    }

    //User can toggle whether or not they completed the workout for that day
    function toggleCompletedStatus(dayData) {
        dayData.completed = !dayData.completed;
        completedWorkoutsCount();
    }
});

/* //Users can toggle whether or not they completed the workout for that day
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
}) */
