const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());

let db = null;
const initializationAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3002/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializationAndServer();

///API1
app.get("/states/", async (request, response) => {
  const getQuery = `SELECT * FROM state`;
  const method = (object) => {
    return {
      stateId: object.state_id,
      stateName: object.state_name,
      population: object.population,
    };
  };
  const getQueryState = await db.all(getQuery);
  response.send(getQueryState.map((each) => method(each)));
});
///API2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `SELECT * FROM state
    WHERE state_id=${stateId}`;
  const method = (object) => {
    return {
      stateId: object.state_id,
      stateName: object.state_name,
      population: object.population,
    };
  };
  const getQueryState = await db.get(getQuery);
  response.send(method(getQueryState));
});
///API3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postQuery = `INSERT INTO 
    district(district_id,district_name,state_id,cases,cured,active,deaths)
    VALUES('${districtName}','${stateId}','${cases}','${cured}','${active}',${deaths}')`;
  const postQueryMethod = await db.run(postQuery);
  response.send("District Successfully Added");
});
