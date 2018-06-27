//  OpenShift sample Node application
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    weather = require('./aemet'),
    parser = require('./parser'),
    helmet = require('helmet');

//****************** VARIABLES ********************
const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
let lastFetchedTimestamp = 0;
let interval = null;
let fetching = false;

//****************** CONFIGURATION ********************
Object.assign = require('object-assign');
app.use(bodyParser.json());
app.use(helmet());

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
                parseDataToFiles(response, now, idMunicipio);
            }, function (error) {
                console.log('Error al obtener los datos del tiempo');
            });
    }
}

function parseDataToFiles(data, timestamp, idMunicipio) {
    fetching = false;
    let today = {};

    try {
        // Datos horarios
        const listaHoraria = parser.parseHourly(data.hourlyData, today);

        // Datos diarios
        const listaDiaria = parser.parseDaily(data.dailyData, today);

        const fichero = {
            today: today,
            daily: listaDiaria,
            hourly: listaHoraria
        };

        // Guardo los ficheros
        fs.writeFileSync('json/municipios/' + idMunicipio + '.json', JSON.stringify(fichero));

        lastFetchedTimestamp = timestamp;
    } catch (e) {
        console.log('Error al parsear los datos a ficheros');
        console.error(e);
    }
}

//****************** ENDPOINTS ********************
app.get('/', function (req, res) {
    res.json({status: 'ok'});
});

app.get('/prediction/:idMunicipio', function (req, res) {
    let idMunicipio = req.params.idMunicipio;

    // Validamos el municipio
    //TODO

    /*
     * TODO
     * Si no existe el fichero de municipio lo que hago es lanzar el proceso que lo obtiene de la web.
     * Luego el interval cogerá todos los diferentes municipios de los nombres de los json y los actualizará
     * pedirá cada municipio en cada 15 segundos, para no saturar y siempre que no haya sido actualizado desde
     * hace 1 hora
     *
     * Puedo crear una array a modo de cola con los id de los municipios a actualizar. El interval sería cada 15 segundos
     * mirando si hay elementos en el array y los va procesando. Otro interval cada hora mete los municipios json existentes
     * en dicha cola, sin duplicados.
     */

    // Cojo el json de este municipio y lo devuelvo
    const file = 'json/municipios/' + idMunicipio + '.json';
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
