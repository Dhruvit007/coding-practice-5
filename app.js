const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started succesfully at localhost port 3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Returns a lis of all the movies name in movie table

app.get("/movies/", async (request, response) => {
  const allmoviesQuery = `
    SELECT movie_name
    FROM movie;
    `;
  const allMoviesObj = await db.all(allmoviesQuery);

  const allMoivesJsArray = [];
  for (let eachMovie of allMoviesObj) {
    console.log(eachMovie);
    allMoivesJsArray.push({
      movieName: eachMovie.movie_name,
    });
  }
  response.send(allMoivesJsArray);
});

// Create new movie in the movie table
app.post("/movies/", async (request, response) => {
  const bodyData = request.body;

  const { directorId, movieName, leadActor } = bodyData;

  const addMovieDataQuery = `
    INSERT INTO movie
    (director_id,movie_name,lead_actor)
    VALUES
    (${directorId},"${movieName}","${leadActor}");
    `;

  await db.run(addMovieDataQuery);
  console.log(addMovieDataQuery);
  response.send("Movie Successfully Added");
});

// 3. get single movie details

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const singleBookQuery = `
  SELECT *
  FROM movie
  WHERE movie_id = ${movieId};
  `;
  let singleMovieDetailsArray = await db.get(singleBookQuery);
  const singleMovieJSobj = {
    movieId: singleMovieDetailsArray.movie_id,
    directorId: singleMovieDetailsArray.director_id,
    movieName: singleMovieDetailsArray.movie_name,
    leadActor: singleMovieDetailsArray.lead_actor,
  };
  response.send(singleMovieJSobj);
});

// 4. Update the details of a movies in the movie table base on movie id

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const reqBody = request.body;
  const { directorId, movieName, leadActor } = reqBody;

  const moviePutQuery = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}";
    `;

  await db.run(moviePutQuery);
  response.send("Movie Details Updated");
});

// 5. Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `;
  console.log(deleteMovieQuery);
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// 6. Return a list of all director in the director table
app.get("/directors", async (request, response) => {
  const allDirectorNameQuery = `
       SELECT *
       FROM director
    `;
  const directorNamesArray = await db.all(allDirectorNameQuery);
  const directorNamesJsArray = [];
  for (let eachDirector of directorNamesArray) {
    directorNamesJsArray.push({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    });
  }
  response.send(directorNamesJsArray);
});

// 7. Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getdirectorMoviesQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = "${directorId}";
    `;
  let directorMoviesDetails = await db.all(getdirectorMoviesQuery);

  let directorMoviesDetailsJsObj = [];
  for (let eachMovie of directorMoviesDetails) {
    directorMoviesDetailsJsObj.push({
      movieName: eachMovie.movie_name,
    });
  }
  response.send(directorMoviesDetailsJsObj);
});

module.exports = app;
