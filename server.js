//  OpenShift sample Node application
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    weather = require('./aemet'),
    parser = require('./parser'),
    helmet = require('helmet'),
    Log = require('./Log');

// Log.setLevel('debug');
// Log.log('Log level set');

//****************** VARIABLES ********************
const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
let fetching = false;
let requestQueue = [];

//****************** CONFIGURATION ********************
Object.assign = require('object-assign');
app.use(bodyParser.json());
app.use(helmet());

// Leo el fichero de municipios
let municipios = fs.readFileSync('json/municipios.json', {encoding: 'utf8'});
municipios = JSON.parse(municipios);

/*fs.readFile('json/municipios_raw.json', {encoding: 'utf8'}, function (err, data) {
    let obj = {};
    data = JSON.parse(data);
    data.forEach(function (muni) {
        let idd = '' + muni.cpro + muni.cmun;
        idd = idd.substring(0, idd.length - 1);
        obj[idd] = muni.nombre;
    });

    fs.writeFileSync('json/municipios.json', JSON.stringify(obj));
});*/


//****************** CRON JOB ********************
// Interval para comprobar si hay elementos en la cola
setInterval(checkQueue, 1000 * 15);
// Interval para añadir elementos a la cola cada hora
setInterval(updateMunicipios, 1000 * 60 * 60);

// TODO llamada mock
// requestQueue.push(24089);
// console.log(requestQueue);

function updateMunicipios() {
    // Log.log('updateMunicipios');
    console.log('updateMunicipios');

    // Recorro los json que hay en la carpeta json/municipios
    fs.readdirSync('json/municipios').forEach(function (file) {
        // Si es un json
        if (file.includes('.json')) {
            // Log.log('  Encontrado municipio', file);

            const muni = file.replace('.json', '');
            // Lo añado a la cola de elementos si no está ya
            if (!requestQueue.includes(muni)) {
                requestQueue.push(muni);
            }
        }
    });
    console.log(requestQueue);

}

function checkQueue() {
    console.log('checkQueue');

    // Si hay cosas que pedir y no estoy ahora mismo procesando algo
    if (requestQueue.length > 0 && !fetching) {
        // Log.log('checkQueue');
        console.log('Hay datos en la cola');

        // Estoy procesando
        fetching = true;
        const idMunicipio = requestQueue.shift();

        // Pido los datos
        weather.weatherData(idMunicipio)
            .then(function (response) {
                console.log('  He obtenido la respuesta de Aemet para ' + idMunicipio);

                // Parseo los datos para generar los json actualizados
                parseDataToFiles(response, idMunicipio);
                fetching = false;
            }, function (error) {
                console.log('Error al obtener los datos del tiempo');
                console.log(error);
                fetching = false;
            });
    }
}

function parseDataToFiles(data, idMunicipio) {
    // Log.log('parseDataToFiles');

    let today = {};

    try {
        // Datos horarios
        const listaHoraria = parser.parseHourly(data.hourlyData, today);

        // Datos diarios
        const listaDiaria = parser.parseDaily(data.dailyData, today);

        const fichero = {
            name: municipios[idMunicipio],
            today: today,
            daily: listaDiaria,
            hourly: listaHoraria
        };

        // Guardo los ficheros
        fs.writeFileSync('json/municipios/' + idMunicipio + '.json', JSON.stringify(fichero));

        // Devuelvo el json
        return fichero;
    } catch (e) {
        console.log('Error al parsear los datos a ficheros');
        console.error(e);
        return null;
    }
}

//****************** ENDPOINTS ********************
app.get('/', function (req, res) {
    res.json({status: 'ok'});
});

app.get('/api/prediction/:idMunicipio', function (req, res) {
    let idMunicipio = req.params.idMunicipio;
    console.log('Petición de predicciones recibida para el municipio ' + idMunicipio);

    // Validamos el municipio
    if (!municipios.hasOwnProperty(idMunicipio)) {
        res.status(500).json({error: true, msg: 'El municipio no existe'});
        return;
    }

    // Cojo el json de este municipio y lo devuelvo
    const file = 'json/municipios/' + idMunicipio + '.json';
    if (fs.existsSync(file)) {
        fs.readFile(file, {encoding: 'utf8'}, function (err, data) {
            if (err) {
                res.status(500).json({error: true});
            } else {
                try {
                    res.json(JSON.parse(data));
                } catch (error) {
                    res.status(500).json({error: true});
                }
            }
        });
    } else {
        // Como no existe, lo pido proactivamente sin esperara a la cola
        weather.weatherData(idMunicipio)
            .then(function (response) {
                // Parseo los datos para generar los json actualizados
                const respuesta = parseDataToFiles(response, idMunicipio);
                if (respuesta !== null) {
                    res.json(respuesta);
                } else {
                    console.log('Error al parsear los datos de la petición');
                    res.status(500).json({error: true});
                }
            }, function (error) {
                console.log('Error al obtener los datos del tiempo');
                console.log(error);
                res.status(500).json({error: true});
            });
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
