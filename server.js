var express = require('express');
var app = express();
var path = require('path');
require('dotenv').config();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient
var db;
const https = require('https');
//const WeatherKey = require('./jeys');
const myjsonCities = require('./cities.json'); //on récupère les données des villes de la cote Atlantique dans le fichier cities.json

//let weatherKey = new WeatherKey(); // récupération des clés  pour se connecter aux API








/*********************************************************************
 * Transformation des données du fichier JSON en objets utilisables *
*********************************************************************/

var jsStringCities =JSON.stringify(myjsonCities);
console.log(jsStringCities);

var ArrayCities = JSON.parse(jsStringCities); // on a ici un tableau d'objets "ville"  ex: { name: 'Biaritz', lat: 43.31, long: -1.31 }


/*********************************************************************
 ****************** Requetes vers l'API de climat *******************
*********************************************************************/

for (let city of ArrayCities){

    console.log("on est rentré dans le for "+ city+" "+ city.lat);
 
    https.get('https://api.weatherbit.io/v2.0/forecast/daily?lat='+city.lat+'&lon='+city.long+'&lang=fr&days=2&key='+process.env.API_KEY , (resp) =>{ //requete prenant en compte les prévisions pour les deux jours suivant dans les 20 villes cotières
    let data='';
  

    resp.on('data', (chunk) =>{
        data += chunk;
    });

    resp.on('end', () => {
       
        dataObj = JSON.parse(data);
        dataObj.city_name = city.name; // dataObj est l'objet contenant les informations météo
        /*********************************************************************
        ************ Etablissement de la connection a mongodb **************
        *********************************************************************/
          MongoClient.connect(process.env.MONGODB_HOST, function (err, database) {
            if (err) 
              throw err
            else
            {
            var db = database.db('meteodb');

            db.collection('meteos').insertOne(dataObj, function (err, result) {
              if (err)
              console.log("error");
              else
              console.log("success :" +process.env.MONGODB_HOST_OL);
        
             });
            console.log('Connected to MongoDB');
            }
          });

       

        console.log(dataObj);
    });
    
    }).on("error", (err) => {
      console.log("Error: " + err.message);

})

}


/*********************************************************************
 ****************** Requetes vers l'API de marées *******************
*********************************************************************/