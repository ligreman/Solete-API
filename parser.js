const parseDaily = function (data, today) {
    let listaFinal = [];

    // console.log(JSON.stringify(data));
    for (let i = 0; i < data.dia.length; i++) {
        // ¿Es el primer día?
        const isToday = (i === 0);

        // El objeto JSON de datos del día
        const dia = data.dia[i];

        // Fecha
        const parts = dia.fecha.split("-");
        const dYear = parts[0];
        const dMonth = parts[1];
        const dDay = parts[2];

        let dayItem = {
            timestamp: parseInt(dYear + dMonth + dDay),
            fecha: getDayFormatted(dYear, dMonth, dDay)
        };

        // Estado del cielo
        const estadoCielo = dia.estadoCielo;
        for (let j = 0; j < estadoCielo.length; j++) {
            // Cojo cada cielo
            const tempObj = estadoCielo[j];

            const period = tempObj.periodo;

            // Si no es today y el periodo es 00-24 me interesa
            if (!isToday && period === "00-24") {
                dayItem.estado = tempObj.value;
            }
        }
        //TODO hay dias en los que la info viene más reducida aún y no hay periodo ni na

        // Precipitacion
        const precipitacion = dia.probPrecipitacion;
        for (let j = 0; j < precipitacion.length; j++) {
            // Cojo cada precipitacion
            const tempObj = precipitacion[j];

            const period = tempObj.periodo;

            // Si no es today y el periodo es 00-24 me interesa
            if (!isToday && period === "00-24") {
                dayItem.precipitacion = tempObj.value;
            }
        }

        // Nieve
        const nieve = dia.cotaNieveProv;
        for (let j = 0; j < nieve.length; j++) {
            // Cojo cada nieve
            const tempObj = nieve[j];

            const period = tempObj.periodo;

            // Si no es today y el periodo es 00-24 me interesa
            if (!isToday && period === "00-24") {
                dayItem.cotaNieve = tempObj.value;
            }
        }

        // Temperatura
        const temperatura = dia.temperatura;
        //Min y Max para el actual y diario
        if (isToday) {
            today.temperaturaMin = temperatura.minima;
            today.temperaturaMax = temperatura.maxima;
        } else {
            dayItem.temperaturaMin = temperatura.minima;
            dayItem.temperaturaMax = temperatura.maxima;
        }

        // vientoAndDireccion
        const viento = dia.viento;
        for (let j = 0; j < viento.length; j++) {
            // Cojo cada viento
            const tempObj = viento[j];

            const period = tempObj.periodo;

            // Si no es today y el periodo es 00-24 me interesa
            if (!isToday && period === "00-24") {
                dayItem.vientoVelocidad = tempObj.velocidad;
                dayItem.vientoDireccion = tempObj.direccion;
            }
        }

        // Una vez finalizado el día, lo añado a la lista final si no es hoy
        if (!isToday) {
            listaFinal.push(dayItem);
        }
    }

    return listaFinal;
};

const parseHourly = function (data, today) {
    let listaFinal = [];

    const ahora = new Date();
    const currentHour = ahora.getHours();

    // console.log(JSON.stringify(data));
    for (let i = 0; i < data.dia.length; i++) {
        let dayList = {};

        // ¿Es el primer día?
        const isToday = (i === 0);

        // El objeto JSON de datos del día
        const dia = data.dia[i];

        // Fecha
        const parts = dia.fecha.split("-");
        const dYear = parts[0];
        const dMonth = parts[1];
        const dDay = parts[2];

        // Estado del cielo
        const estadoCielo = dia.estadoCielo;
        for (let j = 0; j < estadoCielo.length; j++) {
            // Cojo cada cielo
            const tempObj = estadoCielo[j];

            // Si es la hora actual, lo guardo en ahora
            const hourString = tempObj.periodo;
            let hora = 0, theTimestamp = 0;
            try {
                hora = parseInt(hourString);
                theTimestamp = parseInt(dYear + dMonth + dDay + hourString)
            } catch (e) {
                console.error(e);
            }

            // Si es la misma hora que ahora mismo y es el primer día = hoy
            if (hora == currentHour && isToday) {
                today.estado = tempObj.value;
            }
            // Si es mayor a la hora actual pa la lista o si no es hoy
            else if (hora > currentHour || !isToday) {
                // Como todavía la lista está vacía voy creando los elementos
                dayList[hora] = {
                    hora: hourString,
                    fecha: getDayFormatted(dYear, dMonth, dDay),
                    timestamp: theTimestamp,
                    estado: tempObj.value
                };
            }
        }

        // Precipitacion
        const precipitacion = dia.precipitacion;
        for (let j = 0; j < precipitacion.length; j++) {
            // Cojo cada cielo
            const tempObj = precipitacion[j];

            // Si es la hora actual, lo guardo en ahora
            let hora = 0;
            try {
                hora = parseInt(tempObj.periodo);
            } catch (e) {
                console.error(e);
            }

            if (hora == currentHour && isToday) {
                today.precipitacion = tempObj.value;
            }
            // Si es mayor a la hora actual pa la lista
            else if (hora > currentHour || !isToday) {
                // Cojo el elemento
                dayList[hora].precipitacion = tempObj.value;
            }
        }

        // Nieve
        const nieve = dia.nieve;
        for (let j = 0; j < nieve.length; j++) {
            // Cojo cada cielo
            const tempObj = nieve[j];

            // Si es la hora actual, lo guardo en ahora
            let hora = 0;
            try {
                hora = parseInt(tempObj.periodo);
            } catch (e) {
                console.error(e);
            }

            if (hora == currentHour && isToday) {
                today.nieve = tempObj.value;
            }
            // Si es mayor a la hora actual pa la lista
            else if (hora > currentHour || !isToday) {
                // Cojo el elemento
                dayList[hora].nieve = tempObj.value;
            }
        }

        // Temperatura
        const temperatura = dia.temperatura;
        for (let j = 0; j < temperatura.length; j++) {
            // Cojo cada cielo
            const tempObj = temperatura[j];

            // Si es la hora actual, lo guardo en ahora
            let hora = 0;
            try {
                hora = parseInt(tempObj.periodo);
            } catch (e) {
                console.error(e);
            }

            if (hora == currentHour && isToday) {
                today.temperatura = tempObj.value;
            }
            // Si es mayor a la hora actual pa la lista
            else if (hora > currentHour || !isToday) {
                // Cojo el elemento
                dayList[hora].temperatura = tempObj.value;
            }
        }

        // vientoAndRachaMax
        const viento = dia.vientoAndRachaMax;
        for (let j = 0; j < viento.length; j++) {
            // Cojo cada cielo
            const tempObj = viento[j];

            // Si este elemento no tiene velocidad me lo salto
            if (!tempObj.hasOwnProperty("velocidad")) {
                continue;
            }

            // Si es la hora actual, lo guardo en ahora
            let hora = 0;
            try {
                hora = parseInt(tempObj.periodo);
            } catch (e) {
                console.error(e);
            }

            if (hora == currentHour && isToday) {
                today.vientoDireccion = tempObj.direccion[0];
                today.vientoVelocidad = tempObj.velocidad[0];
            }
            // Si es mayor a la hora actual pa la lista
            else if (hora > currentHour || !isToday) {
                // Cojo el elemento
                dayList[hora].vientoDireccion = tempObj.direccion[0];
                dayList[hora].vientoVelocidad = tempObj.velocidad[0];
            }
        }

        // Una vez finalizado el día, lo añado a la lista final
        for (let key in dayList) {
            listaFinal.push(dayList[key]);
        }
    }

    return listaFinal;
};

module.exports = {
    parseDaily: parseDaily,
    parseHourly: parseHourly
};


function getDayFormatted(year, month, day) {
    let result = "", y, m, d;

    try {
        y = parseInt(year);
    } catch (e) {
        y = 0;
    }
    try {
        m = parseInt(month);
    } catch (e) {
        m = 1;
    }
    try {
        d = parseInt(day);
    } catch (e) {
        d = 0;
    }

    // Resto uno al mes siempre
    m--;

    let fecha = new Date(y, m, d);

    switch (fecha.getDay()) {
        case 1:
            result = "Lun. ";
            break;
        case 2:
            result = "Mar. ";
            break;
        case 3:
            result = "Mié. ";
            break;
        case 4:
            result = "Jue. ";
            break;
        case 5:
            result = "Vie. ";
            break;
        case 6:
            result = "Sab. ";
            break;
        case 0:
            result = "Dom. ";
            break;
    }

    return result + day;
}
