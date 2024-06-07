const express = require('express')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 9000

const app = express()

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true ,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ff1pkvw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
  // await client.connect();
  const userCollection = client.db('lifePartnerDB').collection('users')
  const biodataCollection = client.db('lifePartnerDB').collection('biodatas')
  const favouriteCollection = client.db('lifePartnerDB').collection('favourites')
  const successStoryCollection = client.db('lifePartnerDB').collection('stories')

  // save an user in dataBase
  app.post('/users', async(req, res) => {
    const userData = req.body
    const result = await userCollection.insertOne(userData)
    res.send(result)
  })
  app.get('/users', async(req, res) => {
    const result = await userCollection.find().toArray()
    res.send(result)
  })
  // save a biodata in dataBase
  app.post('/biodatas', async(req, res) => {
    const userData = req.body
    const latestBiodata = await biodataCollection.find().sort({ id: -1 }).limit(1).toArray();
    const nextId = latestBiodata.length > 0 ? latestBiodata[0].id + 1 : 1;
    userData.id = nextId;
    const result = await biodataCollection.insertOne(userData)
    res.send(result)
  })
  app.get('/biodatas', async(req, res) => {
    const result = await biodataCollection.find().toArray()
    res.send(result)
  })
  // get specific user biodata 
  app.get('/biodatas/email/:email', async(req, res) => {
    const email = req.params.email
    const query = {email}
    const result = await biodataCollection.find(query).toArray()
    res.send(result)
  })
  // get single biodata by id
  app.get('/biodatas/:id',  async (req, res) => {
    const id = req.params.id 
    const query = {_id: new ObjectId(id)}
    const result = await biodataCollection.findOne(query)
    res.send(result)
  })
  // save a favourite biodata on database
  app.post('/favourites', async(req, res) => {
    const data = req.body
    const result = await favouriteCollection.insertOne(data)
    res.send(result)
  })
  app.get('/favourites', async(req, res) => {
    const result = await favouriteCollection.find().toArray()
    res.send(result)
  })
  // get all favourites biodata 
  app.get('/favourites/email/:email', async(req, res) => {
    const email = req.params.email
    const query = {email}
    const result = await favouriteCollection.find(query).toArray()
    res.send(result)
  })
  // delete favourite biodata 
  app.delete('/favourites/:id', async(req,res) => {
    const id = req.params.id
    const query = {_id: new ObjectId(id)}
    const result = await favouriteCollection.deleteOne(query)
    res.send(result)
  })

  
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
  // Ensures that the client will close when you finish/error
}
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Life Partner...')
})
app.listen(port, ()=> console.log(`Server running on port ${port}`))