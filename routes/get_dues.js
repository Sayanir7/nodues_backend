import express from "express";
import {db} from "../index.js";


const router = express.Router();

router.get("/", async(req,res)=>{
    try {
        const [rows] = await db.execute(`
            SELECT 
                d.dept_id,
                d.dept_name,
                COALESCE(SUM(du.amount), 0) AS total_dues
            FROM 
                departments d
            LEFT JOIN 
                dues du ON d.dept_id = du.dept_id AND du.status = 'pending'
            GROUP BY 
                d.dept_id, d.dept_name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch department dues', details: err.message });
    }
})

router.get("/:id", async (req, res) => {
    const deptId = req.params.id;
    try {
        const [rows] = await db.execute(`
            SELECT 
                d.dept_id,
                d.dept_name,
                COALESCE(SUM(du.amount), 0) AS total_dues
            FROM 
                departments d
            LEFT JOIN 
                dues du ON d.dept_id = du.dept_id AND du.status = 'pending'
            WHERE 
                d.dept_id = ?
            GROUP BY 
                d.dept_id, d.dept_name
        `, [deptId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Department not found or has no dues" });
        }

        res.json(rows[0]); 
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch department dues', details: err.message });
    }
});



export default router;