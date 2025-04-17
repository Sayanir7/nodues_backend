import express from "express";
import multer from "multer";
import csv from "csv-parser";
import {Readable} from "stream";
import {db} from "../index.js";


const router = express.Router();

const upload = multer({storage: multer.memoryStorage()});

router.post("/:dept_id", upload.single("file"), async (req, res)=>{
    let deptId = req.params.dept_id;
    deptId = parseInt(deptId);
    console.log(deptId);

    if(!req.file){

        return res.status(400).json({error: "No file uploaded"});
    }
    const fileBuffer = req.file.buffer;
    const results = [];

    const stream = Readable.from(fileBuffer);
    stream
        .on("error", (err) => {
            res.status(500).json({ error: "Stream processing failed", details: err.message });
        })
        .pipe(csv({ headers: ["std_roll", "amount"], skipLines: 1 }))

        .on("data", (row) => {
            results.push({
                std_roll: row.std_roll,
                amount: parseFloat(row.amount)
            })
            // console.log(results);
        })
        .on("end", async ()=>{
            try {
                // console.log(results);
                await Promise.all(
                    results.map(({ std_roll, amount }) =>
                        db.execute(
                            "INSERT INTO dues (std_roll, dept_id, amount) VALUES (?, ?, ?)",
                            [std_roll, deptId, amount]
                        )
                    )
                );
                // const [result] = await db.execute(
                //     "INSERT INTO dues (std_roll, dept_id, amount) VALUES (?, ?, ?)",
                //     // [results[0].std_roll, deptId, results[0].amount]
                //     [1, 2, 10000]
                // );
                // console.log("Query result:", result);
                res.status(200).json({message: `${results.length} dues records processed`});

            } catch(err){
                res.status(500).json({error: "Failed to process CSV", details: err.message});

            }
        })
        .on("error", (err)=>{
            res.status(500).json({error: "CSV parsing failed", details: err.message});
        });
        // console.log(results);

} );

export default router;
