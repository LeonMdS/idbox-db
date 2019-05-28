const express = require('express');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const path = require('path');

const db = require("./db");
const collection = "arduinos";

app.get('/', (req, res)=>{
    res.sendFile(path.join(_dirname, 'index.html'));
});

app.get('/getArduinos', (req, res)=>{
    db.getDB().collection(collection).find({}).toArray((err, documents)=>{
        if(err)
            console.log(err);
        else{
            console.log(documents);
            res.json(documents);
        }
    });
});

app.post('/:id/:class/:student', (req,res)=>{
    const arduinoID = req.params.id;
    const ClassName = req.params.class;
    const studentID = req.params.student;
    
    db.getDB().collection(collection).updateOne(
        {_id : db.getPrimaryKey(arduinoID)},
        {$inc : { "class.$[class].Students.$[student].Presences" : 1 } },
        { arrayFilters: [ { "class.Name" : ClassName }, { "student.id" : studentID } ] },
        (err, result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }
    });
});


app.put('/', (req,res)=>{
    const userInput = req.body;
    
    db.getDB().collection(collection).insertOne(
        {"class" : []},
        (err, result)=>{
        if(err)
            console.log(err);
        else{
            res.json({result : result, document : result.ops[0]});
        }
    });
});

app.put('/:id', (req,res)=>{
    const arduinoID = req.params.id;
    const userInput = req.body;
    
    db.getDB().collection(collection).updateOne(
        {_id : db.getPrimaryKey(arduinoID)},
        {$push : { class : {
            "Name" : userInput.name,
            "Teacher" : userInput.teacher,
            "Students" : []
        } } },
        (err, result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }
    });
});

app.put('/:id/:class', (req,res)=>{
    const arduinoID = req.params.id;
    const ClassName = req.params.class;
    const userInput = req.body;
    
    db.getDB().collection(collection).updateOne(
        {_id : db.getPrimaryKey(arduinoID)},
        {$push : { "class.$[class].Students" : {
            "Name" : userInput.name,
            "id" : userInput.id,
            "Presences" : 0
        }}},
        { arrayFilters: [ { "class.Name" : ClassName } ] },
        (err, result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }
    });
});


app.delete('/:id', (req,res)=>{
    const arduinoID = req.params.id;

    db.getDB().collection(collection).findOneAndDelete(
        {_id : db.getPrimaryKey(arduinoID)},
        (err, result)=>{
            if(err)
                console.log(err);
            else{
                res.json(result);
            }
        }
    );
});

app.delete('/:id/:class', (req,res)=>{
    const arduinoID = req.params.id;
    const ClassName = req.params.class;

    db.getDB().collection(collection).updateOne(
        {_id : db.getPrimaryKey(arduinoID)},
        {$pull : { class : {
            "Name" : ClassName,
        }}},
        (err, result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }
    });
});

app.delete('/:id/:class/:student', (req,res)=>{
    const arduinoID = req.params.id;
    const ClassName = req.params.class;
    const studentID = req.params.student;

    db.getDB().collection(collection).updateOne(
        {_id : db.getPrimaryKey(arduinoID)},
        {$pull : { "class.$[class].Students" : {
            "id" : studentID
        }}},
        { arrayFilters: [ { "class.Name" : ClassName } ] },
        (err, result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }
    });
});

db.connect((err)=>{
    if(err){
        console.log('Unable to connect to database.')
        process.exit(1);
    }
    else{
        app.listen(process.env.PORT, ()=>{
            console.log('Connected to database, listening on port 3000.')
        });
    }
})