const cheerio = require('cheerio');
const axios = require('axios');
const https = require('https');
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');


// Token de tu bot de Telegram
const token = '7044025504:AAFEQI6DeSwfwuMBtJ00qovKAKBoj7t3ZlM';
// ID del chat al que quieres enviar el mensaje (puedes usar tu propio ID para recibirlo en tu cuenta personal)
const chatId = '2048484355';
// Se crea instancia del Bot
const bot = new TelegramBot(token);

// Busqueda numero 1
01-04-2025
const busquedas = [
  {
    ini: 1,
    fin: 30,
    preUrl: 'https://www.turismocity.com.ar/vuelos/resultados-a-lima-LIM?cabinClass=Economy&s=MDZ-LIM.',
    ultUrl: '-04-2025',
    precioRef: 300000
  },
  {
    ini: 1,
    fin: 31,
    preUrl: 'https://www.turismocity.com.ar/vuelos/resultados-a-lima-LIM?cabinClass=Economy&s=MDZ-LIM.',
    ultUrl: '-05-2025',
    precioRef: 300000
  }
]


async function realizarBusquedas(busquedas) {


  for (const busqueda of busquedas) {
    await realizarSolicitud(busqueda.preUrl, busqueda.ultUrl, busqueda.ini, busqueda.fin, busqueda.precioRef)
  }
}


async function realizarSolicitud(preUrl1, ultUrl1, ini, fin, precioRef) {

  for (let i = ini; i <= fin; i++) {

    try {

      // Inicia una instancia de Puppeteer
      const browser = await puppeteer.launch({ headless: false, args: ['--incognito'] });

      // Abre una nueva página en el navegador
      const page = await browser.newPage();
      const fec = i.toString().padStart(2, '0');
      const url = preUrl1 + fec + ultUrl1;
      // Navega a la URL deseada
      await page.goto(url);
      await new Promise(resolve => setTimeout(resolve, 10000));
      await page.waitForSelector('.top-flight-button.sort-div.top-flight-button-first');
      await page.click('.top-flight-button.sort-div.top-flight-button-first');

      // Obtiene el HTML de la página

      await new Promise(resolve => setTimeout(resolve, 5000));
      const html = await page.content();

      // Carga el HTML en Cheerio para análisis
      const $ = cheerio.load(html);
      const origen = $('.select2-chosen.tc-text-ellipsis').first().text().trim();
      const destino = $('.select2-chosen.tc-text-ellipsis').last().text().trim();
      const fecha = $('.tc-datepicker--dates.tc-text-ellipsis').first().text().trim();



      // Busco cada producto (cuadrados con cada producto con la clase mencionada abajo)

      const elementos = $('li.itinerary.vbox');
      for (let i = 0; i < elementos.length; i++) {
        await procesarElemento(elementos, i);
      }
      await browser.close();

      async function procesarElemento(elementos, i) {

        var aerolinea = $(elementos[i]).find('div.tc-col-airline.row span').text().trim();
        var horaIni = $(elementos[i]).find('div.tc-hhmm').first().text().trim();
        var horaFin = $(elementos[i]).find('div.tc-hhmm').last().find('em').remove().end().text().trim();
        var precio = $(elementos[i]).find('em').last().text().trim();
        var ori = $(elementos[i]).find('span.tc-text-ellipsis.tc-iata').first().text().trim();
        var des = $(elementos[i]).find('span.tc-text-ellipsis.tc-iata').last().text().trim();
        var precioSinPunto = precio.replace(/\./g, '');
        var precioNumero = parseFloat(precioSinPunto)
        var precioConSigno = '$ ' + precio;


        if (precioNumero < precioRef) {

          console.log('Origen: ' + origen);
          console.log('Destino: ' + destino);

          console.log(`
              Aerolínea: ${aerolinea}
              Aeropuerto Origen: ${ori}
              Aeropuerto Destino: ${des}
              Fecha: ${fecha}
              Hora Despegue: ${horaIni}
              Hora Arribo: ${horaFin}
              Precio: ${precioConSigno}
                      `);


          // Enviar mensaje por Telegram
          bot.sendMessage(chatId, '------------OFERTA------------' + "\n" + "De: " + origen + "\n" + "A: " + destino + "\n" + "Aerolinea: " + aerolinea + "\nFecha: " + fecha + "\n" + "Aeropuerto Origen: " + ori + "\nAeropuerto Destino: " + des + "\nHora Despegue: " + horaIni + "\nHora Arribo: " + horaFin + "\nPrecio: " + precioConSigno);
          console.log('-------------------------------------------');
          console.log('');

        }
      }

    } catch (error) {
      console.log('Error al obtener la página:', error);
    }
  }

  console.log("Busqueda Finalizada");
  console.log("");
  console.log('-------------------------------------------');
  console.log("");
}

async function main() {

  /* esto es para que se ejecuten todas al mismo tiempo peros e me cae la pagina e turismocity
    try {
      await Promise.all([
        realizarSolicitud(preUrl1, ultUrl1, ini1, fin1, precio1),
        realizarSolicitud(preUrl2, ultUrl2, ini2, fin2, precio2),
        realizarSolicitud(preUrl3, ultUrl3, ini3, fin3, precio3),
        realizarSolicitud(preUrl4, ultUrl4, ini4, fin4, precio4)
      ]);
    } catch (error) {
      console.log('Error en la ejecución principal:', error);
    }
    setInterval(main, 5 * 60 * 1000); // 5 minutos en milisegundos
  
    */
  await realizarBusquedas(busquedas);

}

main();

// Ejecutar main cada 5 minutos
