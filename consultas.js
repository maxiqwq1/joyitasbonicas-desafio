import pkg from "pg"
import format from "pg-format"


const { Pool } = pkg
const pool = new Pool ({
    host: 'localhost',
    user: 'postgres',
    password: '020310',
    database: 'Joyas',
    allowExitOnIdle: true
});
export default pool;

const testConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW()'); 
        console.log('Conexión exitosa. Fecha y hora actuales:', res.rows[0]);
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
    }
};

testConnection();



export const getJoyas = async (req, res)=> {

    try {
        const { limits, page, order_by } = req.query || {};
        let consulta = 'SELECT * FROM inventario';
        let filtros = [];

       
        if (order_by) {
            const [campo, orden] = order_by.split('_');
            const ordenSql = format('%I %s', campo, orden.toUpperCase()); 
            filtros.push(`ORDER BY ${ordenSql}`);
        }

        
        if (filtros.length > 0) {
            consulta += ' ' + filtros.join(' ');
        }

        
        if (limits && page) {
            const offset = (page - 1) * limits;
            consulta += ` LIMIT ${limits} OFFSET ${offset}`;
        }

       
        const { rows, rowCount } = await pool.query(consulta);

        return {
            result: rows,
            count: rowCount
        };
    } catch (error) {
        console.error('Error al obtener las joyas:', error.message);
        throw new Error('Error al obtener las joyas');
    }




}   


export const getJoyasFiltradas = async (req,res)=> {
    try {
        const { precio_min, precio_max, categoria, metal } = req.query;


        if (!precio_min && !precio_max && !categoria && !metal) {
            throw new Error("Se requieren filtros");
        }
        let consulta = "SELECT * FROM inventario";
        let filtros = [];
        let valores = []

        if (precio_min) {
            filtros.push(`precio >= $${valores.length + 1}`);
            valores.push(precio_min);
        }
        
       
        if (precio_max) {
            filtros.push(`precio <= $${valores.length + 1}`);
            valores.push(precio_max);
        }
        
       
        if (categoria) {
            filtros.push(`categoria = $${valores.length + 1}`);
            valores.push(categoria);
        }
        
       
        if (metal) {
            filtros.push(`metal = $${valores.length + 1}`);
            valores.push(metal);
        }

        if (filtros.length > 0) {
            consulta += " WHERE " + filtros.join(" AND ");
        }

        const { rows, rowCount } = await pool.query(consulta, valores);

        return {
            result: rows,
            count: rowCount
        };
    } catch (error) {
        console.error("Error al obtener las joyas filtradas:", error.message);
        throw new Error("Error al obtener las joyas filtradas");
    }
 
 }