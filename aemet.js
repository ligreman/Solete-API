const request = require('request');

//****************** VARIABLES ********************
const OPENDATA_URI = "https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/";
const OPENDATA_DAILY = "diaria/";
const OPENDATA_HOURLY = "horaria/";
const API_KEY = "?api_key=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsb3ZlaGluYWVzcEBnbWFpbC5jb20iLCJqdGkiOiIwMDlmYzZlNy1iZmMxLTRhZDItOTA2ZC0wZmUzODUzZDg1OTkiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTUyMTg5OTcyOCwidXNlcklkIjoiMDA5ZmM2ZTctYmZjMS00YWQyLTkwNmQtMGZlMzg1M2Q4NTk5Iiwicm9sZSI6IiJ9.WIFq7E8N6Q2ZisfTvbxJfd9ZiVNrUKQlQ_y99aQ_Vrs";

let jsonData = null;

let weatherData = function (idMunicipio) {
    jsonData = {
        idMunicipio: '' + idMunicipio,
        dailyData: null,
        hourlyData: null
    };

    return new Promise(function (resolve, reject) {
        // Pido los datos diarios
        getData(OPENDATA_DAILY)
            .then(function (prediccion) {
                jsonData.dailyData = prediccion;

                // Si ya tengo todos los datos los devuelvo
                if (jsonData.hourlyData !== null) {
                    resolve(jsonData);
                }
            }, function (error) {
                reject();
            });

        // Pido los datos horarios
        getData(OPENDATA_HOURLY)
            .then(function (prediccion) {
                jsonData.hourlyData = prediccion;

                // Si ya tengo todos los datos los devuelvo
                if (jsonData.dailyData !== null) {
                    resolve(jsonData);
                }
            }, function (error) {
                reject();
            });
    });
};

/**
 * Obtiene el json de predicciones
 */
function getData(type) {
    return new Promise(function (resolve, reject) {
        console.log('Consulto: ' + OPENDATA_URI + type + jsonData.idMunicipio);

        // Pido el XML
        request(OPENDATA_URI + type + jsonData.idMunicipio + API_KEY, (error, response, body) => {
            if (response && response.statusCode === 200) {
                let json = null;
                try {
                    json = JSON.parse(body);
                    console.log(json);
                } catch (e) {
                    console.log('Error al parsear data');
                    reject(e);
                }

                if (json.estado && json.estado === 200 && json.datos) {
                    // Recojo la url a llamar
                    const url = json.datos;
                    console.log('Consulto: ' + url);

                    // Cojo los datos de este XML
                    request(url, (error2, response2, body2) => {
                        if (response2 && response2.statusCode === 200) {
                            let json2 = null;
                            try {
                                json2 = JSON.parse(body2);
                                // Si viene array lo desarrayo
                                if (Array.isArray(json2)) {
                                    json2 = json2[0];
                                }
                                console.log(json2);
                            } catch (e) {
                                console.log('Error al parsear data');
                                reject(e);
                            }

                            // Convierto a string los id
                            const id = '' + json2.id;
                            if (id === jsonData.idMunicipio) {
                                resolve(json2.prediccion);
                            } else {
                                console.log('Error: no coindide el id de datos diarios con el municipio');
                                reject();
                            }
                        }
                    });
                } else {
                    console.log('Error, en el xml no vienen bien los datos');
                    reject(e);
                }
            } else {
                console.log('Error: los xml diarios no contienen datos correctos');
                reject();
            }
        });
    });
}

module.exports = {
    weatherData: weatherData
};
