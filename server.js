// mongodb+srv://lucerno:jwppb3ej@smartmobile-vev7c.azure.mongodb.net/test?retryWrites=true&w=majority
const express = require("express");
const bodyParser = require("body-parser")
const app = express();
const port = 3000;
const mongoose = require('mongoose');



mongoose
.connect('mongodb+srv://lucerno:jwppb3ej@smartmobile-vev7c.azure.mongodb.net/test?retryWrites=true&w=majority',
    {useNewUrlParser: true}
)
.then(()=> console.log("DB Connected"))
.catch(err => console.error(err));


// Create database Schemas
const Schema = mongoose.Schema;


// Define the person schema
const personSchema = new Schema({
    name: String,
    age: Number,
    hometown: String
});

// Inititialize the model 
const Person = mongoose.model('Person', personSchema);




// Initialize express middle ware for handling POST data
//app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded


// dummy data
const myCollection = {
    people: [{
            id: 0,
            name: "John",
            age: "19",
            hometown: "Eindhoven"
        },
        {
            id: 1,
            name: "Dirk",
            age: "43",
            hometown: "Budel"
        },
        {
            id: 2,
            name: "Henk",
            age: "22",
            hometown: "Tilburg"
        }
    ]
};


// Retrieve all people
//app.get("/api/people", (req, res) => res.json(myCollection));

app.get("/api/people", (req, res) => {
    Person.find((err, results) => {
    res.json(results);
    });
});

// Retrieve person by id
app.get("/api/people/:id", (req, res) => {
    Person.findById(req.params.id, (err, result) => {
        res.json(result);
    });
});


//Add person
app.post("/api/people", (req, res) => {
//console.log(req.body);


let person = new Person({
    ...req.body
});

person.save((err, newPerson) => {
    console.log("person saved");
    res.json({ status: "succes", person: newPerson });
});

//myCollection.people.push(person);






});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));