let parseDaily = function (data, today) {
    let listaFinal = [];

    console.log(JSON.stringify(data));
    for (let i = 0; i < data.dias.length; i++) {
        // ¿Es el primer día?
        const isToday = (i === 0);

        // El objeto JSON de datos del día
        const dia = data.dias[i];

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

let parseHourly = function (data) {

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


/*
public static List<WeatherListItem> parseHourlyInfo(JSONObject data) {
        // Los datos los guardo aquí
        List<WeatherListItem> listaFinal = new ArrayList<>();

        JSONArray dias;
        Calendar calander = Calendar.getInstance();
        int currentHour = calander.get(Calendar.HOUR_OF_DAY);

        // Cojo el array de días
        try {
            dias = data.getJSONArray("dia");
            Log.i("SOLECITO", "HourlyInfo");
//            Log.i("SOLECITO", dias.toString());

            // Voy recorriendo cada día
            JSONObject dia, tempObj;
            Hashtable<Integer, WeatherListItem> dayList = new Hashtable<>();

            for (int i = 0; i < dias.length(); i++) {
                // Limpio la lista
                dayList.clear();

                // ¿Es el primer día?
                boolean isToday = i == 0;

                // El objeto JSON de datos del día
                dia = dias.getJSONObject(i);

                // Fecha
                String[] parts = dia.getString("fecha").split("-");
                String dYear = parts[0];
                String dMonth = parts[1];
                String dDay = parts[2];

                // Estado del cielo
                JSONArray estadoCielo = dia.getJSONArray("estadoCielo");
                for (int j = 0; j < estadoCielo.length(); j++) {
                    // Cojo cada cielo
                    tempObj = estadoCielo.getJSONObject(j);

                    // Si es la hora actual, lo guardo en ahora
                    String hourString = tempObj.getString("periodo");
                    int hora = Integer.parseInt(hourString);

                    // Si es la misma hora que ahora mismo y es el primer día = hoy
                    if (hora == currentHour && isToday) {
                        today.setEstado(tempObj.getString("value"));
                    }
                    // Si es mayor a la hora actual pa la lista o si no es hoy
                    else if (hora > currentHour || !isToday) {
                        // Como todavía la lista está vacía voy creando los elementos
                        dayList.put(hora, new WeatherListItem(
                                hourString,
                                Utils.getDayFormatted(dYear, dMonth, dDay),
                                Integer.parseInt(dYear + dMonth + dDay + hourString),
                                tempObj.getString("value")
                        ));
                        //                                Utils.getMonthDayFormatted(dMonth, dDay),
                    }
                }

                // Precipitacion
                JSONArray precipitacion = dia.getJSONArray("precipitacion");
                for (int j = 0; j < precipitacion.length(); j++) {
                    // Cojo cada cielo
                    tempObj = precipitacion.getJSONObject(j);

                    // Si es la hora actual, lo guardo en ahora
                    int hora = Integer.parseInt(tempObj.getString("periodo"));
                    if (hora == currentHour && isToday) {
                        today.setPrecipitacion(tempObj.getString("value"));
                    }
                    // Si es mayor a la hora actual pa la lista
                    else if (hora > currentHour || !isToday) {
                        // Cojo el elemento
                        WeatherListItem tempItem = dayList.get(hora);
                        tempItem.setPrecipitacion(tempObj.getString("value"));
                        dayList.put(hora, tempItem);
                    }
                }

                // Nieve
                JSONArray nieve = dia.getJSONArray("nieve");
                for (int j = 0; j < nieve.length(); j++) {
                    // Cojo cada cielo
                    tempObj = nieve.getJSONObject(j);

                    // Si es la hora actual, lo guardo en ahora
                    int hora = Integer.parseInt(tempObj.getString("periodo"));
                    if (hora == currentHour && isToday) {
                        today.setNieve(tempObj.getString("value"));
                    }
                    // Si es mayor a la hora actual pa la lista
                    else if (hora > currentHour || !isToday) {
                        // Cojo el elemento
                        WeatherListItem tempItem = dayList.get(hora);
                        tempItem.setNieve(tempObj.getString("value"));
                        dayList.put(hora, tempItem);
                    }
                }

                // Temperatura
                JSONArray temperatura = dia.getJSONArray("temperatura");
                for (int j = 0; j < temperatura.length(); j++) {
                    // Cojo cada cielo
                    tempObj = temperatura.getJSONObject(j);

                    // Si es la hora actual, lo guardo en ahora
                    int hora = Integer.parseInt(tempObj.getString("periodo"));
                    if (hora == currentHour && isToday) {
                        today.setTemperatura(tempObj.getString("value"));
                    }
                    // Si es mayor a la hora actual pa la lista
                    else if (hora > currentHour || !isToday) {
                        // Cojo el elemento
                        WeatherListItem tempItem = dayList.get(hora);
                        tempItem.setTemperatura(tempObj.getString("value"));
                        dayList.put(hora, tempItem);
                    }
                }

                // vientoAndRachaMax
                JSONArray viento = dia.getJSONArray("vientoAndRachaMax");
                for (int j = 0; j < viento.length(); j++) {
                    // Cojo cada cielo
                    tempObj = viento.getJSONObject(j);

                    // Si este elemento no tiene velocidad me lo salto
                    if (!tempObj.has("velocidad")) {
                        continue;
                    }

                    // Si es la hora actual, lo guardo en ahora
                    int hora = Integer.parseInt(tempObj.getString("periodo"));
                    if (hora == currentHour && isToday) {
                        today.setVientoDireccion(tempObj.getJSONArray("direccion").getString(0));
                        today.setVientoVelocidad(tempObj.getJSONArray("velocidad").getString(0));
                    }
                    // Si es mayor a la hora actual pa la lista
                    else if (hora > currentHour || !isToday) {
                        // Cojo el elemento
                        WeatherListItem tempItem = dayList.get(hora);
                        tempItem.setVientoDireccion(tempObj.getJSONArray("direccion").getString(0));
                        tempItem.setVientoVelocidad(tempObj.getJSONArray("velocidad").getString(0));
                        dayList.put(hora, tempItem);
                    }
                }

                // Una vez finalizado el día, lo añado a la lista final
                for (Integer key : dayList.keySet()) {
                    listaFinal.add(dayList.get(key));
                }
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }

        return listaFinal;
    }



 */
