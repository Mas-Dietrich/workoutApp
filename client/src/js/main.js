//Display Inspirational Quote in the banner start
let inspirationalQuote = document.querySelector("#inspirationalQuote");

document.addEventListener("DOMContentLoaded", function () {
  const quoteContainer = document.querySelector(".quote-banner");

  // Make a request to the server's /quotes endpoint
  fetch("/quotes")
    .then((response) => response.json())
    .then((data) => {
      const quote = `${data.quote} -${data.author}`;

      inspirationalQuote.textContent = quote;
    })
    .catch((error) => {
      console.error("Error fetching quote:", error);
    });
});
// Display Inspirational Quote in the banner end

let workouts;

//Dynamically display workout data from server.js
document.addEventListener("DOMContentLoaded", function () {
  const workoutTablesContainer = document.getElementById("workoutTables");
  const completedWorkoutsTracker = document.getElementById("completedWorkouts");
  fetch("/workouts")
    .then((response) => response.json())
    .then((data) => {
      workouts = data;

      workouts.forEach((dayData) => {
        const card = createCard(dayData);
        workoutTablesContainer.appendChild(card);

        //toggle completed status for completed workout days
        if (dayData.completed) {
          card.classList.add("completed");
        }

        //toggle rest day status on workout days
        if (dayData.rest) {
          card.classList.add("rest");
        }
      });
      completedWorkoutsCount();
    })
    .catch((error) => {
      console.error("Error fetching workout data: ", error);
    });

  //Function to dynamically create card for the specific day's workout
  function createCard(dayData) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-day", dayData.day);

    //Workout's day of the week
    const heading = document.createElement("h2");
    heading.textContent =
      dayData.day.charAt(0).toUpperCase() + dayData.day.slice(1);
    card.appendChild(heading);

    //Workout data table
    const table = createTable(dayData);
    card.appendChild(table);

    //Note taking textarea, once done taking note, user hits save, it will add notes to server and append notes to workout card
    const workoutNotes = document.createElement("textarea");
    workoutNotes.id = "notes";
    workoutNotes.name = "notes";
    workoutNotes.rows = "4";
    workoutNotes.cols = "30";
    workoutNotes.placeholder = "Your Notes Here...";
    workoutNotes.value = dayData.notes.join("/n");

    const saveNotesButton = createButton("saveNotes", "save");
    saveNotesButton.addEventListener("click", () =>
      saveNotes(workoutNotes.value, dayData, notesList)
    );
    card.appendChild(workoutNotes);

    //Workout form for user to fill to add workout to data table
    const addWorkoutForm = workoutForm(dayData);
    addWorkoutForm.style.display = "none";
    card.appendChild(addWorkoutForm);

    const notesList = document.createElement("ul");
    dayData.notes.forEach((note) => {
      const listItem = document.createElement("li");
      listItem.textContent = note;
      notesList.appendChild(listItem);
    });

    workoutNotes.addEventListener("blur", () =>
      updateNotesList(notesList, dayData)
    );

    card.appendChild(workoutNotes);
    card.appendChild(saveNotesButton);
    card.appendChild(notesList);
    //Workout Notes End

    //Complete workout button, rest day button, and add workout button
    const completeButton = createButton("completeWorkout", "check");
    //Event listener for completeButton
    completeButton.addEventListener("click", () =>
      toggleCompletedStatus(card, dayData)
    );

    const restDayButton = createButton("restDay", "bed");
    //Event listener for restDayButton
    restDayButton.addEventListener("click", () =>
      toggleRestStatus(card, dayData)
    );

    const addWorkoutButton = createButton("addWorkout", "plus");
    //Event listener for addWorkoutButton
    addWorkoutButton.addEventListener("click", () =>
      toggleWorkoutForm(addWorkoutForm)
    );

    card.appendChild(completeButton);
    card.appendChild(restDayButton);
    card.appendChild(addWorkoutButton);

    return card;
  }

  //function to create Data Table and keep styling from static iteration of app
  function createTable(dayData) {
    const table = document.createElement("table");
    table.classList.add("workout-table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Workout", "Weight", "Reps", "Sets", ""].forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    dayData.exercises.forEach((exercise, rowIndex) => {
      const row = document.createElement("tr");
      ["exercise", "weight", "reps", "sets"].forEach((prop, colIndex) => {
        const td = document.createElement("td");
        const cellText = exercise[prop];
        td.textContent = cellText;
        td.contentEditable = true;
        td.addEventListener("click", () =>
          handleCellEdit(td, dayData, rowIndex, colIndex)
        );
        row.appendChild(td);
      });
      //adding delete button for each workout
      const deleteButtonCell = document.createElement("td");
      const deleteButton = createButton("deleteWorkout", "times");
      deleteButton.addEventListener("click", () =>
        deleteWorkout(dayData, rowIndex)
      );
      deleteButtonCell.appendChild(deleteButton);
      row.appendChild(deleteButton);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
  }

  //Function for editing workout data
  function handleCellEdit(cell, dayData, rowIndex, colIndex) {
    if (document.querySelector(".editing")) {
      return;
    }
    cell.classList.add("editing");

    const originalContent = cell.textContent;

    //listeners for editing
    cell.addEventListener("keydown", (event) =>
      handleCellKeyDown(
        event,
        cell,
        dayData,
        rowIndex,
        colIndex,
        originalContent
      )
    );
    cell.addEventListener("blur", () =>
      handleCellBlur(cell, dayData, rowIndex, colIndex, originalContent)
    );
  }

  //Handle editing, if a user enters, it will update, if they hit escape it will cancel editing
  function handleCellKeyDown(
    event,
    cell,
    dayData,
    rowIndex,
    colIndex,
    originalContent
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      cell.blur();
    } else if (event.key === "Escape") {
      cell.textContent = originalContent;
      cell.blur();
    } else if (
      isNumericColumn(colIndex) &&
      !isValidInput(event.key, event.ctrlKey, event.metaKey)
    ) {
      event.preventDefault();
    }
  }

  //Handle editing, if new content is actually new, update the server data
  function handleCellBlur(cell, dayData, rowIndex, colIndex, originalContent) {
    cell.classList.remove("editing");

    const newContent = cell.textContent;
    if (newContent !== originalContent) {
      // Only update if the content has changed
      dayData.exercises[rowIndex][
        Object.keys(dayData.exercises[rowIndex])[colIndex]
      ] = newContent;

      updateServer(dayData);
    } else {
      // Restore original content if the content is the same
      cell.textContent = originalContent;
    }
  }

  //Function to check if user is editing a weight, rep or sets column
  function isNumericColumn(colIndex) {
    return colIndex === 1 || colIndex === 2 || colIndex === 3;
  }

  //Function for making sure only num is used in updating weight, reps and sets data
  function isValidInput(key, ctrlKey, metaKey) {
    // Allow backspace, delete, and empty content
    return (
      (key.length === 1 && ((key >= "0" && key <= "9") || key === "")) ||
      key === "Backspace" ||
      key === "Delete" ||
      ctrlKey ||
      metaKey
    );
  }

  // Function to handle the deletion of a workout
  function deleteWorkout(dayData, rowIndex) {
    const confirmation = confirm(
      "Are you sure you want to delete this workout?"
    );
    if (confirmation) {
      // Send a DELETE request to remove the workout
      fetch(`/workouts/${dayData.day}/${rowIndex}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);

          // Update the local workouts array
          workouts = data.exercise;

          // Re-render the exercises table on the UI
          updateWorkoutTables();
        })
        .catch((error) => {
          console.error("Error deleting workout:", error);
        });
    }
  }

  //Function to create buttons for the cards
  function createButton(className, iconClass) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add(className);
    const icon = document.createElement("i");
    icon.classList.add("fa", `fa-${iconClass}`);
    button.appendChild(icon);

    return button;
  }

  //Function to update number of completed workouts
  function completedWorkoutsCount() {
    const completedWorkouts = workouts.filter((day) => day.completed).length;
    completedWorkoutsTracker.textContent = `${completedWorkouts} / 7 Workouts Complete`;
  }

  //Function to toggle Rest Day styling on cards
  function toggleRestStatus(card, dayData) {
    dayData.rest = !dayData.rest;
    updateServer(dayData);

    card.classList.toggle("rest", dayData.rest);
  }

  //User can toggle whether or not they completed the workout for that day
  function toggleCompletedStatus(card, dayData) {
    dayData.completed = !dayData.completed;
    updateServer(dayData);
    completedWorkoutsCount();

    card.classList.toggle("completed", dayData.completed);
    checkAllWorkoutsCompleted();
  }

  //Function so user can saves notes for their workout
  function saveNotes(notes, dayData, notesList) {
    // Ensure dayData.notes is an array, and concatenate new notes to existing notes
    dayData.notes = (dayData.notes || []).concat(notes.split("\n"));

    // Remove any empty strings from the notes array
    dayData.notes = dayData.notes.filter((note) => note.trim() !== "");

    // Update the server with the modified dayData
    updateServer(dayData);

    // Update the notes list on the UI
    updateNotesList(notesList, dayData);

    const workoutNotes = document.getElementById("notes");
    workoutNotes.value = ""; // Clear the textarea after saving notes
  }

  // Function to update the bullet list
  function updateNotesList(list, dayData) {
    list.innerHTML = "";

    dayData.notes.forEach((note, index) => {
      const listItem = document.createElement("li");

      const editNoteButton = createButton("editNote", "edit");
      editNoteButton.addEventListener("click", () => editNotes(dayData, index));

      const deleteButton = createButton("deleteNote", "trash-alt");
      deleteButton.addEventListener("click", () => deleteNotes(dayData, index));

      listItem.textContent = note;
      listItem.appendChild(editNoteButton);
      listItem.appendChild(deleteButton);
      list.appendChild(listItem);
    });
  }

  //Function for deleting notes
  function deleteNotes(dayData, index) {
    // Remove the note from the array
    dayData.notes.splice(index, 1);

    // Update the server with the modified dayData
    updateServer(dayData);

    // Re-render the notes list on the UI
    const notesList = document.createElement("ul");
    dayData.notes.forEach((note, index) => {
      const listItem = document.createElement("li");

      // Create a delete button for each note
      const deleteButton = createButton("deleteNote", "trash-alt");
      deleteButton.addEventListener("click", () => deleteNotes(dayData, index));

      listItem.textContent = note;
      listItem.appendChild(deleteButton);
      notesList.appendChild(listItem);
    });

    // Update the notes list in the card
    const card = document.querySelector(`[data-day="${dayData.day}"]`);
    const oldNotesList = card.querySelector("ul");
    oldNotesList.replaceWith(notesList);
  }

  //Function to edit notes
  function editNotes(dayData, index) {
    const editedNote = prompt("Edit your note:", dayData.notes[index]);

    if (editedNote !== null) {
      // Check if the user pressed cancel
      // Update the note in the array
      dayData.notes[index] = editedNote;

      // Update the server with the modified dayData
      updateServer(dayData);

      // Re-render the notes list on the UI
      const notesList = document.createElement("ul");
      dayData.notes.forEach((note, index) => {
        const listItem = document.createElement("li");

        // Create an edit button for each note
        const editButton = createButton("editNote", "edit");
        editButton.addEventListener("click", () => editNotes(dayData, index));

        // Create a delete button for each note
        const deleteButton = createButton("deleteNote", "trash-alt");
        deleteButton.addEventListener("click", () =>
          deleteNotes(dayData, index)
        );

        listItem.textContent = note;
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        notesList.appendChild(listItem);
      });

      // Update the notes list in the card
      const card = document.querySelector(`[data-day="${dayData.day}"]`);
      const oldNotesList = card.querySelector("ul");
      oldNotesList.replaceWith(notesList);
    }
  }

  //Function to display form for manual input of workouts
  function workoutForm(dayData) {
    const form = document.createElement("form");
    form.classList.add("add-workout-form");

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Workout";
    nameInput.name = "workoutName";

    const weightInput = document.createElement("input");
    weightInput.type = "number";
    weightInput.placeholder = "Weight";
    weightInput.name = "weight";

    const repsInput = document.createElement("input");
    repsInput.type = "number";
    repsInput.placeholder = "Reps";
    repsInput.name = "reps";

    const setsInput = document.createElement("input");
    setsInput.type = "number";
    setsInput.placeholder = "Sets";
    setsInput.name = "sets";

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent = "Add Workout";
    submitButton.addEventListener("click", () =>
      addWorkout(dayData, nameInput, weightInput, repsInput, setsInput)
    );

    const chooseWorkoutButton = document.createElement("button");
    chooseWorkoutButton.type = "button";
    chooseWorkoutButton.textContent = "Choose a Workout";
    chooseWorkoutButton.addEventListener("click", () =>
      chooseWorkoutForm(dayData)
    );

    form.appendChild(nameInput);
    form.appendChild(weightInput);
    form.appendChild(repsInput);
    form.appendChild(setsInput);
    form.appendChild(submitButton);
    form.appendChild(chooseWorkoutButton);

    return form;
  }

  //Function to add/POST manually added workouts to data table
  //Function to add/POST manually added workouts to data table
  function addWorkout(dayData, nameInput, weightInput, repsInput, setsInput) {
    const workoutName = nameInput.value.trim();
    const weight = parseInt(weightInput.value, 10);
    const reps = parseInt(repsInput.value, 10);
    const sets = parseInt(setsInput.value, 10);

    if (workoutName && !isNaN(weight) && !isNaN(reps) && !isNaN(sets)) {
      const newWorkout = {
        exercise: workoutName,
        weight: weight,
        reps: reps,
        sets: sets,
      };

      // Send a POST request to add the new workout
      fetch(`/workouts/${dayData.day}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWorkout),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);

          // Update the local workouts array
          workouts = data.workouts;

          // Re-render the exercises table on the UI
          updateWorkoutTables();
          completedWorkoutsCount(); // Update completed workouts count if needed

          // Toggle away the addWorkoutForm
          const card = document.querySelector(`[data-day="${dayData.day}"]`);
          const addWorkoutForm = card.querySelector(".add-workout-form");
          toggleWorkoutForm(addWorkoutForm);
        })
        .catch((error) => {
          console.error("Error adding workout:", error);
        });
    } else {
      alert("Invalid Workout Data. Please Try Again.");
    }
  }

  //Toggles the workout form when add workout button is clicked
  function toggleWorkoutForm(form) {
    form.style.display = form.style.display === "none" ? "block" : "none";
  }

  //Function for adding workouts from API
  function chooseWorkoutForm(dayData) {
    const chooseWorkoutContainer = document.getElementById(
      "chooseWorkoutContainer"
    );

    const muscleDropdown = document.createElement("select");
    muscleDropdown.id = "muscleDropdown";

    const muscleGroups = ["Abdominals", "Biceps", "Chest", "Lower Back"];

    muscleGroups.forEach((muscle) => {
      const option = document.createElement("option");
      option.value = muscle.toLowerCase().replace(" ", "_");
      option.text = muscle;
      muscleDropdown.appendChild(option);
    });

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.id = "submitWorkout";
    submitButton.textContent = "Find Workouts";
    submitButton.addEventListener("click", () =>
      getExercises(dayData, chooseWorkoutContainer)
    );

    chooseWorkoutContainer.appendChild(muscleDropdown);
    chooseWorkoutContainer.appendChild(submitButton);
  }

  //Gather exercises from API and display options with descriptions of exercises
  async function getExercises(dayData, chooseWorkoutContainer) {
    const selectedMuscle = document.getElementById("muscleDropdown").value;

    // Remove existing workout options
    const existingWorkoutContainer =
      document.getElementById("workoutContainer");
    if (existingWorkoutContainer) {
      chooseWorkoutContainer.removeChild(existingWorkoutContainer);
    }

    try {
      const response = await fetch(`/exercises?muscle=${selectedMuscle}`);
      const data = await response.json();

      console.log("Exercise Data:", data);

      const workoutContainer = document.createElement("div");
      workoutContainer.id = "workoutContainer";

      data.forEach((exercise) => {
        const exerciseOption = document.createElement("div");
        exerciseOption.classList.add("workout-item");

        const exerciseName = document.createElement("h3");
        exerciseName.textContent = exercise.name;

        const learnMoreButton = createButton("learnMore", "info");
        learnMoreButton.textContent = "Learn More";
        learnMoreButton.addEventListener("click", () => {
          alert(
            `How to do the ${exercise.name} exercise: \n\n ${exercise.instructions}`
          );
        });

        const addWorkoutButton = createButton("addWorkout", "plus");
        addWorkoutButton.textContent = "Add Workout";
        addWorkoutButton.addEventListener("click", () =>
          addSelectedWorkout(exercise, dayData)
        );

        exerciseOption.appendChild(exerciseName);
        exerciseOption.appendChild(learnMoreButton);
        exerciseOption.appendChild(addWorkoutButton);
        workoutContainer.appendChild(exerciseOption);
      });

      chooseWorkoutContainer.appendChild(workoutContainer);
    } catch (error) {
      console.error(`Error: ${error}`);
      // Handle error, e.g., display an error message to the user
    }
  }

  //Adds workout to user's data
  function addSelectedWorkout(workout, dayData) {
    const defaultValues = { weight: 0, reps: 0, sets: 0 };

    const newWorkout = {
      exercise: workout.name,
      ...defaultValues,
    };

    dayData.exercises.push(newWorkout);

    updateServer(dayData);

    const workoutTablesContainer = document.getElementById("workoutTables");
    const card = document.querySelector(`[data-day="${dayData.day}"]`);
    const oldTable = card.querySelector(".workout-table");
    const newTable = createTable(dayData);
    oldTable.replaceWith(newTable);
    completedWorkoutsCount(); // Update completed workouts count if needed

    // Remove the workout data after a user has selected their workout
    const workoutContainer = document.querySelector("#chooseWorkoutContainer");
    const muscleDropdown = document.querySelector("#muscleDropdown");

    if (workoutContainer) {
      workoutContainer.style.display = "none";
    }

    if (muscleDropdown) {
      muscleDropdown.style.display = "none";
    }

    // Toggle away the addWorkoutForm
    const addWorkoutForm = card.querySelector(".add-workout-form");
    toggleWorkoutForm(addWorkoutForm);

    // Toggle away the "Find Workouts" button
    const findWorkoutsButton =
      workoutTablesContainer.querySelector("#submitWorkout");

    if (findWorkoutsButton) {
      findWorkoutsButton.style.display = "none";
    }
  }

  // Function to update workout tables with the latest data
  function updateWorkoutTables() {
    const workoutTablesContainer = document.getElementById("workoutTables");

    // Clear existing tables
    workoutTablesContainer.innerHTML = "";

    // Fetch the latest workout data and re-render the tables
    fetch("/workouts")
      .then((response) => response.json())
      .then((data) => {
        const workouts = data;

        workouts.forEach((dayData) => {
          const card = createCard(dayData);
          workoutTablesContainer.appendChild(card);

          // Toggle completed status for completed workout days
          if (dayData.completed) {
            card.classList.add("completed");
          }

          // Toggle rest day status on workout days
          if (dayData.rest) {
            card.classList.add("rest");
          }
        });

        completedWorkoutsCount(); // Update completed workouts count if needed
      })
      .catch((error) => {
        console.error("Error fetching workout data:", error);
      });
  }

  // Check if all workouts are completed and show a congratulations message
  function checkAllWorkoutsCompleted() {
    const allCompleted = workouts.every((day) => day.completed);

    if (allCompleted) {
      alert("Congratulations! You completed all of your workouts!");
    }
  }
});

//Function to PUT changes from client side to server side
function updateServer(dayData) {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dayData),
  };

  fetch(`/workouts/${dayData.day}`, options)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error updating workout on server:", error);
    });
}
