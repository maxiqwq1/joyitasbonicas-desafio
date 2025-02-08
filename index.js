import express from "express"
import cors from "cors"
import { getJoyas, getJoyasFiltradas } from "./consultas.js";


const app = express();
const PORT = 3000;


app.use(express.json());
app.use (cors())




app.get('/joyas', async (req, res)=>{
    try {
        const { result: joyas, count: rowCount } = await getJoyas(req, res); 
        const links = {
            self: 'http://localhost:3000/joyas',  
            filtros: 'http://localhost:3000/joyas/filtros',
        }

        if (rowCount === 0) {
            return res.status(404).json({
                message: 'No se encontraron joyas',
            });
        }

        const result = {
            total_joyas: rowCount,
            joyas: joyas.map(joya => ({
                id: joya.id,
                nombre: joya.nombre,
                precio: joya.precio,
                categoria: joya.categoria,
                metal: joya.metal,
                stock: joya.stock,
                _links: {
                    self: {
                        href: `http://localhost:3000/joyas/${joya.id}`,
                    },
                    all_joyas: {
                        href: 'http://localhost:3000/joyas',
                    }
                }
            })),
            _links: {
                self: {
                    href: 'http://localhost:3000/joyas',
                },
                filters: {
                    href: 'http://localhost:3000/joyas/filtros',
                }
            }
        };



        if (req.query.page && req.query.limit) {
            const nextPage = parseInt(req.query.page) + 1;
            links.nextPage = `http://localhost:3000/joyas?limit=${req.query.limit}&page=${nextPage}`;
        }


        res.json(result);
    } catch (error) {
       
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error al obtener las joyas' });
        }
    }
})


app.get('/joyas/filtros', async (req,res)=>{
    try {
        console.log("Parámetros recibidos:", req.query)
        

    
        const result = await getJoyasFiltradas(req,res)
        const links = {
            self: 'http://localhost:3000/joyas/filtros',  
            joyas: 'http://localhost:3000/joyas',

        };
        res.json({
            ...result,
            _links: links 
        });

    } catch (error) {
        console.error('Error al obtener las joyas filtradas:', error.message);
        res.status(500).json({ error: 'Error al obtener las joyas filtradas' });
    }
})

app.use((err, req, res, next) => {
    console.error(err.stack);  
    res.status(500).json({ error: 'Algo salió mal en el servidor' });  
});

app.listen(PORT, ()=> {
    console.log(`Servidor corriendo en http://localhost:${PORT} `)
}
)