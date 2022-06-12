const axios = require('axios')
var path = require('path');
require('dotenv').config();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient
var db;
const https = require('https');
//const WeatherKey = require('./jeys');
const myjsonCities = require('./cities.json'); //on récupère les données des villes de la cote Atlantique dans le fichier cities.json
const myjsonCities2 = require('./cities2.json');
const myjsonCities3 = require('./cities3.json');
//let weatherKey = new WeatherKey(); // récupération des clés  pour se connecter aux API



/*************************************************************************
 * Création de la promise qui permet d'attendre entre deux appels à l'API *
**************************************************************************/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait5() {
  
      console.log(`Pause 5 seconde...`);
      await sleep(5000);
  
  console.log('Done');
}

function sleep2(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

/*********************************************************************
 * Transformation des données du fichier JSON en objets utilisables *
*********************************************************************/

var jsStringCities =JSON.stringify(myjsonCities);
var jsStringCities2 =JSON.stringify(myjsonCities2);
var jsStringCities3 =JSON.stringify(myjsonCities3);
//console.log(jsStringCities);

var ArrayCities = JSON.parse(jsStringCities); // on a ici un tableau d'objets "ville"  ex: { name: 'Biaritz', lat: 43.31, long: -1.31 }
var ArrayCities2 = JSON.parse(jsStringCities2); 
var ArrayCities3 = JSON.parse(jsStringCities3); 
/*********************************************************************
 ****************** Requetes vers l'API de climat *******************
*********************************************************************/



function makeGetRequest(city){
  return new Promise(function (resolve, reject) {
    axios.get('https://api.weatherbit.io/v2.0/forecast/daily?lat='+city.lat+'&lon='+city.long+'&lang=fr&days=2&key='+process.env.API_KEY).then( (resp) => { //requete prenant en compte les prévisions pour les deux jours suivant dans les 20 villes cotières
    var data= resp.data;
    console.log("process de request");
    resolve (data);
    },
    (error) => {
      console.log(error);
    });
  });
}

/*********************************************************************
 ******** Fonction Async permettant l'espacement des requetes  *******
*********************************************************************/

async function request(Array){

  for (let city of Array){

    console.log("on est rentré dans le for "+ city+" "+ city.lat);
    var response = await makeGetRequest(city);
    
    

       recorDate= Date.now();
        
        //dataObj.city_name = city.name; // dataObj est l'objet contenant les informations météo
        response.record_date=recorDate;
        /*********************************************************************
        ************ Etablissement de la connection a mongodb **************
        *********************************************************************/
       
          MongoClient.connect(process.env.MONGODB_HOST, function (err, database) {
            if (err) 
              throw err
            else
            {
            console.log('Connected to MongoDB');
            var db = database.db('meteodb');

            db.collection('meteos').insertOne(response, function (err, result) {
              if (err)
              console.log("error");
              else
              console.log("success :");
        
             });
            
            }
          });

      /*On attend avant la prochaine requete à l'API pour laisser le temps a l'app de ranger toutes les infos*/ 
    sleep2(1000);
  }
}

request(ArrayCities);
request(ArrayCities2);
request(ArrayCities3);

/*********************************************************************
 ****************** Requetes vers l'API de marées *******************
*********************************************************************/