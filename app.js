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
  const getQuery = `
  SELECT *
 FROM state
 ORDER BY state_id;`;
  const method = (object) => {
    return {
      stateId: object.state_id,
      stateName: object.state_name,
      population: object.population,
    };
  };
  const getQueryState = await db.all(getQuery);
  const result = getQueryState.map((each) => {
    return method(each);
  });
  response.send(result);
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
    district(district_name,state_id,cases,cured,active,deaths)
    VALUES('${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}')`;
  const postQueryMethod = await db.run(postQuery);
  response.send("District Successfully Added");
});
///API4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `
  SELECT * 
  FROM district
    WHERE district_id=${districtId}`;
  const method = (obj) => {
    return {
      districtId: obj.district_id,
      districtName: obj.district_name,
      stateId: obj.state_id,
      cases: obj.cases,
      cured: obj.cured,
      active: obj.active,
      deaths: obj.deaths,
    };
  };
  const getQueryDist = await db.get(getQuery);
  response.send(method(getQueryDist));
});

///API5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM district
    WHERE district_id=${districtId}`;
  await db.run(deleteQuery);
  response.send("District Removed");
});
///API6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateQuery = `UPDATE district
    SET 
   district_name='${districtName}',
   state_id='${stateId}',
   cases='${cases}',
   cured='${cured}',
   active='${active}',
    deaths='${deaths}';
    WHERE district_id=${districtId};`;
  await db.run(updateQuery);
  response.send("District Details Updated");
});
///API7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `SELECT sum(cases) AS cases,
  sum(cured) AS cured,
  sum(active) AS  active,
  sum(deaths) AS deaths
  FROM district
 WHERE state_id=${stateId}; `;
  const method = (obj) => {
    return {
      totalCases: obj.cases,
      totalCured: obj.cured,
      totalActive: obj.active,
      totalDeaths: obj.deaths,
    };
  };
  const getTotal = await db.get(getQuery);
  response.send(method(getTotal));
});
///API8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `SELECT state_name
  FROM state JOIN district ON state.state_id=district.state_id
  WHERE district.district_id=${districtId}`;
  const getResponse = await db.get(getQuery);
  response.send({ stateName: getResponse.state_name });
});
module.exports = app;
