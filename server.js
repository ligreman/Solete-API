//  OpenShift sample Node application
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    weather = require('./aemet'),
    parser = require('./parser');

//****************** VARIABLES ********************
const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
let lastFetchedTimestamp = 0;
let interval = null;
let fetching = false;

//****************** CONFIGURATION ********************
Object.assign = require('object-assign');
app.use(bodyParser.json());

//****************** CRON JOB ********************
// setInterval(getMunicipioData, 1000 * 60);
getMunicipioData();

function getMunicipioData() {
    const idMunicipio = 24089;
    let now = new Date().getTime();

    // Si ha pasado más de 1 hora desde el último fetch y no estoy fetcheando ahora mismo
    if (!fetching && now > (lastFetchedTimestamp + 60 * 60 * 1000)) {
        fetching = true;

        // Pido los datos
        weather.weatherData(idMunicipio)
            .then(function (response) {
                // Parseo los datos para generar los json actualizados
                parseDataToFiles(response, now);
            }, function (error) {
                console.log('Error al obtener los datos del tiempo');
            });
    }
}

function parseDataToFiles(data, timestamp) {
    fetching = false;
    lastFetchedTimestamp = timestamp;

    let today = {};

    // Datos horarios
    let listaHoraria = parser.parseHourly(data.hourlyData, today);

    // Datos diarios
    let listaDiaria = parser.parseDaily(data.dailyData, today);
}

//****************** ENDPOINTS ********************
app.get('/', function (req, res) {
    res.json({status: 'ok'});
});

app.get('/prediction/:idMunicipio', function (req, res) {
    let idMunicipio = req.params.idMunicipio;

    // Cojo el json de este municipio y lo devuelvo
    const file = 'json/' + idMunicipio + '.json';
    if (fs.existsSync(file)) {
        fs.readFileSync(file, {encoding: 'utf8'}, (err, data) => {
            if (err) {
                res.status(500).json({error: true});
            } else {
                try {
                    res.send(JSON.parse(data));
                } catch (error) {
                    res.status(500).json({error: true});
                }
            }
        });
    } else {
        res.status(500).json({error: true});
    }
});

//****************** ERROR HANDLING ********************
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
