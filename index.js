const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// midlleware 

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('server is Runnning');
});


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
        const blogCollection = client.db('toy_db').collection('blogs');

        app.get('/blogs',async(req,res)=>{
            const result = await blogCollection.find().toArray();
            res.send(result);
        })
        app.get('/alltoy', async (req, res) => {
            const result = await toyCollection.find().limit(20).toArray();
            res.send(result);
        });
        app.get('/toy/:subCategory', async (req, res) => {
            const subCategory = req.params.subCategory;
            const result = await toyCollection.find({ subcategory: subCategory }).toArray();
            res.send(result);
        });
        app.get('/singletoy/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        });

        app.get('/top-rated-toy', async (req, res) => {

            const result = await toyCollection.find().sort({ ratting: -1 }).limit(6).toArray();
            res.send(result);
        });


        app.get('/toys', async (req, res) => {
            const email = req.query.email;
            const order = req.query.order;
            let query = {};
            if (req.query?.email) {
                query = { email: email };
            }

            const sortOrder = req.query.order === 'highest' ? -1 : 1;
            const result = await toyCollection.find(query).sort({ price: sortOrder }).toArray();

            res.send(result);
        });

        app.get('/toysearch/:name', async (req, res) => {
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
            const body = req.body;
            body.price = parseFloat(body.price);
            const result = await toyCollection.insertOne(body);
            res.send(result);
        });
        app.patch('/toyUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    ...body
                },
            };
            const result = await toyCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.delete('/toyDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running on Port: ${port}`);
});