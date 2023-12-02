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

            //toggle rest day status on workout days
            if (dayData.rest) {
                card.classList.add('rest')
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
        card.setAttribute('data-day', dayData.day)

        //Workout's day of the week
        const heading = document.createElement('h2')
        heading.textContent = dayData.day.charAt(0).toUpperCase() + dayData.day.slice(1);
        card.appendChild(heading)

        //Workout data table
        const table = createTable(dayData)
        card.appendChild(table)

        //Note taking textarea, once done taking note, user hits save, it will add notes to server and append notes to workout card
        const workoutNotes = document.createElement('textarea')
        workoutNotes.id = "notes";
        workoutNotes.name = "notes";
        workoutNotes.rows = "4";
        workoutNotes.cols = "30";
        workoutNotes.placeholder = "Your Notes Here...";
        workoutNotes.value = dayData.notes.join('/n');

        const saveNotesButton = createButton("saveNotes", "save");
        saveNotesButton.addEventListener('click', () => saveNotes(workoutNotes.value, dayData, notesList))
        card.appendChild(workoutNotes)

        const notesList = document.createElement('ul');
        dayData.notes.forEach((note) => {
            const listItem = document.createElement('li')
            listItem.textContent = note;
            notesList.appendChild(listItem)
        })

        workoutNotes.addEventListener('blur', () => updateNotesList(notesList, dayData))

        card.appendChild(workoutNotes)
        card.appendChild(saveNotesButton);
        card.appendChild(notesList)

        //Complete workout button, rest day button, and add workout button
        const completeButton = createButton("completeWorkout", "check")
        //Event listener for completeButton
        completeButton.addEventListener('click', ()=> toggleCompletedStatus(card, dayData))

        const restDayButton = createButton("restDay", "bed")
        //Event listener for restDayButton
        restDayButton.addEventListener('click', ()=> toggleRestStatus(card, dayData))

        const addWorkoutButton = createButton("addWorkout", "plus")
        //Event listener for addWorkoutButton

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
        dayData.exercises.forEach((exercise, rowIndex) => {
            const row = document.createElement('tr');
            ['exercise', 'weight', 'reps', 'sets'].forEach((prop, colIndex) => {
                const td = document.createElement('td')
                const cellText = exercise[prop]
                td.textContent = cellText;
                td.contentEditable = true;
                td.addEventListener('click', () => handleCellEdit(td, dayData, rowIndex, colIndex));
                row.appendChild(td)
            });
            tbody.appendChild(row)
        });
        table.appendChild(tbody)

        return table;
    }

    //Function for editing workout data
    function handleCellEdit(cell, dayData, rowIndex, colIndex) {
        if (document.querySelector('.editing')) {
            return;
        }
        cell.classList.add('editing')

        const originalContent = cell.textContent

        //listeners for editing
        cell.addEventListener('keydown', (event) => handleCellKeyDown(event, cell, dayData, rowIndex, colIndex, originalContent))
        cell.addEventListener('blur', () => handleCellBlur(cell, dayData, rowIndex, colIndex, originalContent))
    }

    //Handle editing, if a user enters, it will update, if they hit escape it will cancel editing
    function handleCellKeyDown(event, cell, dayData, rowIndex, colIndex, originalContent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            cell.blur()
        } else if (event.key === 'Escape'){
            cell.textContent = originalContent;
            cell.blur()
        } else if (isNumericColumn(colIndex) && !isValidInput(event.key, event.ctrlKey, event.metaKey)) {
        event.preventDefault();
        }
    }

    //Handle editing, if new content is actually new, update the server data
    function handleCellBlur(cell, dayData, rowIndex, colIndex, originalContent) {
        cell.classList.remove('editing')
    
        const newContent = cell.textContent
        if (newContent !== originalContent) {
            // Only update if the content has changed
            dayData.exercises[rowIndex][Object.keys(dayData.exercises[rowIndex])[colIndex]] = newContent;
    
            updateServer(dayData)
        } else {
            // Restore original content if the content is the same
            cell.textContent = originalContent;
        }
    }

    //Function to check if user is editing a weight, rep or sets column
    function isNumericColumn(colIndex) {
        return colIndex === 1 || colIndex === 2 || colIndex === 3
    }

    //Function for making sure only num is used in updating weight, reps and sets data
    function isValidInput(key, ctrlKey, metaKey) {
        // Allow backspace, delete, and empty content
        return (
            (key.length === 1 && ((key >= '0' && key <= '9') || key === '')) ||
            key === 'Backspace' ||
            key === 'Delete' ||
            ctrlKey ||
            metaKey
        );
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

    function toggleRestStatus(card, dayData) {
        dayData.rest = !dayData.rest;
        updateServer(dayData)

        card.classList.toggle('rest', dayData.rest)
    }


    //User can toggle whether or not they completed the workout for that day
    function toggleCompletedStatus(card, dayData) {
        dayData.completed = !dayData.completed;
        updateServer(dayData)
        completedWorkoutsCount();

        card.classList.toggle('completed', dayData.completed)
    }


    //Function so user can saves notes for their workout
    function saveNotes(notes, dayData, notesList) {
        // Ensure dayData.notes is an array, and concatenate new notes to existing notes
        dayData.notes = (dayData.notes || []).concat(notes.split('\n'));
        
        // Remove any empty strings from the notes array
        dayData.notes = dayData.notes.filter(note => note.trim() !== '');

        // Update the server with the modified dayData
        updateServer(dayData);

        // Update the notes list on the UI
        updateNotesList(notesList, dayData);

        const workoutNotes = document.getElementById('notes')
        workoutNotes.value = '';

    }

    //Function for updating bullet list
    function updateNotesList(list, dayData) {
        list.innerHTML = '';

        dayData.notes.forEach((note, index) => {
            const listItem = document.createElement('li')

            const editNoteButton = createButton('editNote', 'edit')
            editNoteButton.addEventListener('click', ()=> editNotes(dayData, index))

            const deleteButton = createButton('deleteNote', 'trash-alt');
            deleteButton.addEventListener('click', () => deleteNotes(dayData, index))

            listItem.textContent = note
            listItem.appendChild(editNoteButton)
            listItem.appendChild(deleteButton)
            list.appendChild(listItem)
        })
    }

    function deleteNotes(dayData, index) {
        // Remove the note from the array
        dayData.notes.splice(index, 1);
      
        // Update the server with the modified dayData
        updateServer(dayData);
      
        // Re-render the notes list on the UI
        const notesList = document.createElement('ul');
        dayData.notes.forEach((note, index) => {
          const listItem = document.createElement('li');
          
          // Create a delete button for each note
          const deleteButton = createButton("deleteNote", "trash-alt");
          deleteButton.addEventListener('click', () => deleteNotes(dayData, index));
          
          listItem.textContent = note;
          listItem.appendChild(deleteButton);
          notesList.appendChild(listItem);
        });
      
        // Update the notes list in the card
        const card = document.querySelector(`[data-day="${dayData.day}"]`);
        const oldNotesList = card.querySelector('ul');
        oldNotesList.replaceWith(notesList);
      }

      //Function to edit notes
      function editNotes(dayData, index) {
        const editedNote = prompt('Edit your note:', dayData.notes[index]);
      
        if (editedNote !== null) { // Check if the user pressed cancel
          // Update the note in the array
          dayData.notes[index] = editedNote;
      
          // Update the server with the modified dayData
          updateServer(dayData);
      
          // Re-render the notes list on the UI
          const notesList = document.createElement('ul');
          dayData.notes.forEach((note, index) => {
            const listItem = document.createElement('li');
      
            // Create an edit button for each note
            const editButton = createButton("editNote", "edit");
            editButton.addEventListener('click', () => editNotes(dayData, index));
      
            // Create a delete button for each note
            const deleteButton = createButton("deleteNote", "trash-alt");
            deleteButton.addEventListener('click', () => deleteNotes(dayData, index));
      
            listItem.textContent = note;
            listItem.appendChild(editButton);
            listItem.appendChild(deleteButton);
            notesList.appendChild(listItem);
          });
      
          // Update the notes list in the card
          const card = document.querySelector(`[data-day="${dayData.day}"]`);
          const oldNotesList = card.querySelector('ul');
          oldNotesList.replaceWith(notesList);
        }
      }
});

//Function to PUT changes from client side to server side
function updateServer(dayData) {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dayData),
    };

    fetch(`/workouts/${dayData.day}`, options)
      .then(response => response.json())
      .catch(error => {
        console.error('Error updating workout on server:', error);
      });
  }

