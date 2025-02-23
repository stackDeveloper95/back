(async () => {
    const fetch = (await import('node-fetch')).default;
    const { WebPDFLoader } = require("@langchain/community/document_loaders/web/pdf");
    const { Blob } = require('buffer');
    const express = require('express');
    const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters")
    const cors=require("cors");

    const app = express();
    const port = 3200;

    app.use(express.json());
    app.use(cors());

    app.post('/', async (req, res) => { 
        console.log("sna")
        try {
            const { url } = req.body;
    
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }
    
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    
            const loader = new WebPDFLoader(blob);
            const docs = await loader.load();
    
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 300,
                chunkOverlap: 50,
            });
    
            let content = ""; // Change from `const` to `let`
            docs.forEach((doc) => {
                content += doc.pageContent+" "; // Concatenate page content
            });
            console.log(content)
    
            const texts = await textSplitter.createDocuments([content]);
            const arrayvalus=[];
            texts.forEach((text)=>{
                arrayvalus.push(text.pageContent)

            })
            res.json({result:arrayvalus});
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
    

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
})();
