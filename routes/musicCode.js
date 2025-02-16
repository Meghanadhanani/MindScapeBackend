const express = require('express');
const { MongoClient, GridFSBucket } = require('mongodb');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const Musicuri = "mongodb+srv://niky:123@cluster0.zgjay.mongodb.net/test"
const client = new MongoClient(Musicuri);

async function run() {
    try {
        await client.connect();
        const database = client.db("test"); 
        const bucket = new GridFSBucket(database, { bucketName: "fs" });

        // Endpoint to list all available audio files
                
        router.get('/audio', async (req, res) => {
            try {
                const files = await bucket.find().toArray();
                
                
                let htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Audio Files</title>
                    </head>
                    <body>
                        <h1>Audio Files</h1>
                        <ul>`;
                
                files.forEach(file => {
                    htmlContent += `
                        
                           <h1> 
                            <audio controls>
                                <source src="/audio/play/${file.filename}" type="audio/mpeg">
                                Your browser does not support the audio tag.
                            </audio>
                            </h1>
                        `;
                });

                htmlContent += `
                        </ul>
                    </body>
                    </html>`;

                res.send(htmlContent); 
            } catch (error) {
                console.error('Error fetching files:', error);
                res.status(500).send('Error fetching files');
            }
        });

        // Endpoint to stream the audio file
        router.get('/audio/play/:filename', (req, res) => {
            const filename = req.params.filename; 

            const downloadStream = bucket.openDownloadStreamByName(filename);

            downloadStream.on('error', (error) => {
                console.error('Error downloading file:', error);
                return res.status(404).send('File not found');
            });

           
            res.set('Content-Type', 'audio/mpeg'); 
            downloadStream.pipe(res);
        });


        
    } catch (error) {
        console.error(error);
    }
}

run().catch(console.error);

module.exports=router 


