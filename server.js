// import dependencies/modules
const express = require('express');
const fs = require('fs');
const path = require('path');

// use uniqid to generate unique id's
var uniqid = require('uniqid');

// configure express
const app = express();
const PORT = process.env.PORT || 3000;

// make sure to use JSON to easily get data from API requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// set static files so CSS/JS will work (thanks Tim)
app.use(express.static('public'));

// Routes
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, './public/notes.html')));

app.get('/api/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './db/db.json'), (err) => {
        if(err) throw err;
    });
});

// Create new notes!
app.post('/api/notes', (req, res) => {
    // use object send in post request to form new note
    var note = req.body;

    // utilize uniqid package to create unique ID
    note.id = uniqid();

    // read db.json file, extract data into array, then re-write file w/ new note
    fs.readFile(path.join(__dirname, './db/db.json'), (err, data) => {
        if(err) throw err;

        // parse JSON data to create array 
        var currentFile = JSON.parse(data);

        // push new note into that array
        currentFile.push(note);
        
        // overwrite file w/ new JSON
        fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(currentFile), (err) => {
            if(err) throw err;
            console.log(`File saved: added note ID ${note.id}`);
        });
    });

    res.sendFile(path.join(__dirname, './db/db.json'));
  });

// Set route for deleting notes
app.delete('/api/notes/:id', (req, res) => {
    // pull data from db.json file
    fs.readFile(path.join(__dirname, './db/db.json'), (err, data) => {
        // self explanatory
        if(err) throw err;

        // parse JSON data to create array 
        var notes = JSON.parse(data);

        // use findIndex method to figure out where data is in db.json file
        var noteIndex = notes.findIndex(note => note.id === req.params.id);

        // delete that note from currentFile array, which holds db.json data
        notes.splice(noteIndex,1);

        // overwrite file w/ new JSON in currentFile array
        fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(notes), (err) => {
            if(err) throw err;
            console.log(`File updated: deleted note ID ${req.params.id}`);
        });
    });

    res.sendFile(path.join(__dirname, './db/db.json'));
});

// Basic route that sends the user first to the AJAX Page
app.get('*', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

// Starts the server to begin listening
app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));