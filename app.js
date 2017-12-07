const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const mongodb =require('mongodb');
const mongoose = require('mongoose');
let city;

// Open Weather APIKey
const apiKey = 'efb85d115b4de0d8083339bb18ddfcd4';

//Define a schema
var Schema = mongoose.Schema;

var reviewSchema = new Schema({
    city: String,
    review: String,
    time: Number
});

var Review = mongoose.model('Review', reviewSchema);



// DataBase Config
mongoose.connect('mongodb://vovaparkhomchuk:admin@ds131546.mlab.com:31546/weather');
let db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to MongoDB');
})


// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;


//Bind connection to error event (to get notification of connection errors)
db.on('error', function(err) {
  console.log(err);
});


const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



app.get('/', function (req, res) {
    res.render('index', {
      weather: null, 
      error: null
    });
});
app.post('/', function (req, res) {
    city = req.body.city;
    city = city.toLowerCase();
    let f_date = new Date(); 
    let f_time = f_date.getTime();
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    Review.find({city: city}, (err, reviews) => {
      if (err) {
        console.log(err);
      } else {    
        request(url, function (err, response, body) {
          if(err){
            res.render('index', {weather: null, error: 'Error, please try again'});
          } else {
            let weather = JSON.parse(body)
            if(weather.main == undefined){
              res.render('index', {weather: null, error: 'Error, please try again'});
            } else {
              let temp = weather.main.temp - 32;
              temp = Math.ceil((temp)*10)/10;
              let loc = weather.name;
              let weatherText = `It's ${temp}°C in ${loc}!`;
              res.render('index', {
                weather: weatherText, 
                error: null, 
                reviews: reviews,
                time: f_time
              });
            }
          }
        });
      }
    });   
})



app.get('/review', (req, res) => {
  res.render('review');
});
app.post('/review', (req, res) => {
  let rev = req.body.review;
  let day = new Date(); 
  let time = day.getTime();
  console.log(city);
  console.log(rev);
  console.log(day.getTime());
  res.render('review');


  var review = new Review({
    city: city,
    review: rev,
    time: time
  });

  review.save(function (err) {
    if (err) return console.error(err);
  });

});




app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
