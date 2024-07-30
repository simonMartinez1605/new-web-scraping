import { chromium } from "playwright";
import express from 'express'
import cors from 'cors'

const app = express(); 

app.use(cors()); 
app.use(express.json())

const scraping = async (item, res) => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Mercado Libre
    await page.goto(`https://listado.mercadolibre.com.co/${item}`);
    const products = await page.$$eval(
        '.andes-card.ui-search-result.ui-search-result--core.andes-card--flat.andes-card--padding-16',
        (results) => (
            results.map((el) => {
                const title = el.querySelector('h2')?.innerText;
                if (!title) return null;

                const image = el.querySelector('img')?.getAttribute('src');
                const price = el.querySelector('.andes-money-amount__fraction')?.innerText;
                const link = el.querySelector('.ui-search-official-store-item__link.ui-search-link')?.getAttribute('href');

                const rango = results.length;

                let contador = Math.random(100);

                let new_products = {
                    Nombre: title,
                    precio: price,
                    imagen: image,
                    url: link,
                    ID: contador + rango,
                    Page: "MercadoLibre"
                };

                return new_products;
            })
        )
    );

    // Falabella
    // await page.goto(`https://www.exito.com/s?q=${item}`); 
    // const exito_products = await page.$$eval(
    //     '.product-card-no-alimentos_fsProductCardNoAlimentos__1N1Y5',
    //     (results) => (
    //         results.map((el) => {
    //             const title = el.querySelector('a')?.innerText;
    //             if (!title) return null; 

    //             const image = el.querySelector('.imagen_plp')?.getAttribute('src');
    //             const price = el.querySelector('.ProductPrice_container__price__LS1Td')?.innerText;
    //             const url = el.querySelector('.jsx-3573353038.pod.pod-linklink_fs-link__6oAwa').getAttribute('href');

    //             const rango = results.length;
    //             const contador = Math.random(10);

    //             let new_products = {
    //                 titulo: title,
    //                 precio: price,
    //                 imagen: image,
    //                 url: url,
    //                 ID: contador + rango,
    //                 Page: "Exito"
    //             };

    //             return new_products;
    //         })
    //     )
    // );

    // Cerrar el navegador
    
    // Enviar ambos resultados juntos como un objeto
    await browser.close();
    res.send({ mercadoLibre: products});
};

app.post('/scraping',async (req, res)=>{
    try {
        await scraping(req.body.value, res);
    } catch (error) {
        console.log(`Error ${error}`)
    }
})

const port = process.env.PORT||4000; 

app.listen(port, console.log(`listening port ${port}`)); 