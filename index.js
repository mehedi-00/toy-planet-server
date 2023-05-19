const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// midlleware 

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k8bloyi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        const toyCollection = client.db('toy_db').collection('toys');
        

        app.get('/alltoy', async (req, res) => {
            const result = await toyCollection.find().toArray();
            res.send(result);
        });
        app.get('/toy/:name', async (req, res) => {
            const toyName = req.params.name;

            const result = await toyCollection
                .find({
                    $or: [
                        { toy_name: { $regex: toyName, $options: "i" } }

                    ],
                })
                .limit(20).toArray();
        
            res.send(result);
        });

        app.post('/addtoy', async (req, res) => {

            const result = await toyCollection.insertOne(req.body);
            res.send(result);
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('server is Runnning');
});



app.listen(port, () => {
    console.log(`Server is running on Port: ${port}`);
});