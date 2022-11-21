const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()


// middleware
app.use(cors())
app.use(express.json());

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fcz36cz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        client.connect()
        const productsCollection = client.db('young-fashion').collection('products');
        const cartCollection = client.db('young-fashion').collection('carts');

        // get all products
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            let products;
            products = await cursor.toArray();
            const search = req.query.search
            if (search) {
                const searchResult = products.filter(product => product.name.toLowerCase().includes(search))
                res.send(searchResult)
            }
            else {
                const page = parseInt(req.query.page);
                const size = parseInt(req.query.size);
                // some work for pagination
                const query = {};
                const cursor = productsCollection.find(query);

                if (page || size) {
                    products = await cursor.skip(page * size).limit(size).toArray();
                }
                else {
                    products = await cursor.toArray();
                }
                const search = req.query.search;
                res.send(products);
            }
        })

        // add new Product
        app.post('/products', async(req,res)=>{
            const newProduct = req.body;
            const product = await productsCollection.insertOne(newProduct);
            res.send(product)
        })

        // delete product
        app.delete('/products/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await productsCollection.deleteOne(query);
            res.send(result)
        })

        app.post('/carts', async(req,res)=>{
            console.log(req.body)
            const cart = req.body;
            const result = await cartCollection.insertOne(cart);
            res.send(result)
        })



    }

    finally {

    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('express is run')
})

app.listen(port, () => {
    console.log('server is running')
})