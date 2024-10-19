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


// URL de las paginas web sin paginas
const url1 = 'https://www.turismocity.com.ar/vuelos-baratos-a-BUE-Buenos_Aires_Argentina?from=MDZ&type=oneway&d=20240901.20240930';
const precio1= 25000;
const url2 = 'https://www.turismocity.com.ar/vuelos-baratos-a-MDZ-Governor_Francisco_Gabrielli_Intl?from=BUE&type=oneway&d=20240901.20240930';
const precio2= 25000;
//const url3 = 'https://www.fravega.com/l/herramientas-y-construccion/herramientas/herramientas-electricas/taladros/?sorting=LOWEST_SALE_PRICE';
//const precio3= 40000;


async function realizarSolicitud(url, precioRef) {

  try{

    // Inicia una instancia de Puppeteer
    const browser = await puppeteer.launch({ headless: true, args: ['--incognito'] });

 // Abre una nueva página en el navegador
 const page = await browser.newPage();


  // Navega a la URL deseada
  await page.goto(url);



  await new Promise(resolve => setTimeout(resolve, 10000));


  // Obtiene el HTML de la página
  const html = await page.content();

  // Cierra el navegador          white-space: nowrap;
  //await browser.close();

  // Carga el HTML en Cheerio para análisis
  const $ = cheerio.load(html);

  const origen = $('.select2-chosen.tc-text-ellipsis').first().text().trim();

  const destino = $('.select2-chosen.tc-text-ellipsis').last().text().trim();



          // Busco cada producto (cuadrados con cada producto con la clase mencionada abajo)
          const elementos = $('tbody tr');
         // console.log(elementos.html());
          // Para cada elemento encontrado hago lo siguiente:

          elementos.each((index, element) => {
         
            var fecha = $(element).find('td div').first().text().trim();

            //console.log(fecha); // Con Find, dentro de element busco la clase que contiene la Descripcion del producto, y luego obtengo el texto y luego recorto espacios en blanco con el Trim
            var precioConSigno = $(element).find('.priceWrapper').text().trim(); // Con Find, dentro de element busco la clase que contiene el Precio del producto, y luego obtengo el texto y luego recorto espacios en blanco con el Trim
            var precioSinSigno = precioConSigno.replace('$', ''); // Quito el signo peso
           var precio = parseFloat(precioSinSigno.replace(/\./g, '').replace(',', '.')); // Elimina los puntos, y luego reemplaza las comas por puntos
            var href = $(element).find('td div a').last().attr('href').trim();
            var link = "https://www.turismocity.com.ar" + href;

         


          //  var destno= $(element).find('.priceWrapper').text().trim();

          //console.log("FECHA: " + fecha + " Precio: " + precioConSigno + " Link: " + link);



            if (precio < precioRef) {
              console.log('------------OFERTA------------' +  "\n" + "De: " + origen + "\n" + "A: " + destino + "\n" + "Fecha: " + fecha + "\nPrecio: " + precioConSigno + "\n" + link);
              // Enviar mensaje por Telegram
              bot.sendMessage(chatId, '------------OFERTA------------' +  "\n" + "De: " + origen + "\n" + "A: " + destino + "\n" + "Fecha: " + fecha + "\nPrecio: " + precioConSigno + "\n" + link);
              console.log("");
            }
            //}else{
            //console.log("NO COMPRAR");
            //}
            

          });      
   // }
    
 // }catch(error){
  //  console.log('Error al obtener la página:', error);
 // }



}catch(error){
  console.log('Error al obtener la página:', error);
}

}


// Realizar la solicitud inicialmente
//realizarSolicitud();
//setInterval(realizarSolicitud, 120000);

// Establecer un intervalo para realizar la solicitud cada 10 segundos


async function main() {
  console.log("vuevlo a buscar");
  await realizarSolicitud(url1, precio1);
  await realizarSolicitud(url2, precio2);
 // await realizarSolicitud(url3, precio3);
}

main();

// Ejecutar main cada 5 minutos
setInterval(main, 5 * 60 * 1000); // 5 minutos en milisegundos