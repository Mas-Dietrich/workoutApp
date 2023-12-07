# Swoly Workouts

User Stories:
=====
1. Users are greeted by a motivational quote banner upon entering the app thanks to [API Ninjas](https://api-ninjas.com/api/quotes)
2. Users have an exercise dashboard with days of the week provided for users to input workout data
3. Users can browse and add workouts to a day of the week's workout plan thanks to [API Ninjas](https://api-ninjas.com/api/exercises)
4. Users can remove workouts from daily workout plans
5. Users can toggle whether or not they completed a days workout
6. Users can toggle whether or not a day was a rest day.
7. Users can input and save notes about a day's workout
8. Users can edit saved notes about a day's workout
9. Users can delete saved notes about a day's workout
10. Users can input weight for individual workouts
11. Users can input reps for individual workouts
12. Users can input sets for individual workouts
13. Users can edit any details about an individual workout they want
14. Users can manually add their own workouts to a workout plan
15. Users have a dynamically updating indicator stating how many workouts out of 7 have been accomplished

API Endpoints
=====

### GET
1. app.get('/quotes') for inspirational quotes from external API
2. app.get('/workouts') for user workout data
3. app.get('/exercises') for exercises from external API
### POST
1. app.put('/workouts/:day') is utilized to post new workouts data whenever the app is updated by users
### PUT
1. app.put('/workouts/:day') for updating workout data for a specific day of the week
### DELETE
1. app.delete('/workouts/:day') is used to delete workouts as a whole from the server