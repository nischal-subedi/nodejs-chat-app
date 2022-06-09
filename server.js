var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

// CORS ENABLED
var cors = require('cors');

app.use(cors('*'));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

var Message = mongoose.model('Message', {
  name: String,
  message: String
})

// // Referring to K8 Secret using process.env {Storing in variables to make it neat and easy}
var username = process.env.NODE_MONGODB_USERNAME
var password = process.env.NODE_MONGODB_PASSWORD
var url = process.env.NODE_DATABASE_SERVER_URL
var port = process.env.NODE_DATABASE_SERVER_PORT
// // var database = process.env.MONGO_DATABASE

// For K8 (With Reference to Secrets)
var dbUrl = `mongodb://${username}:${password}@${url}:${port}`

app.get('/messages', cors(), (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({ name: user }, (err, messages) => {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try {
    var message = new Message(req.body);

    var savedMessage = await message.save()
    console.log('saved');

    var censored = await Message.findOne({ message: 'badword' });
    if (censored)
      await Message.remove({ _id: censored.id })
    else
      io.emit('message', req.body);
    res.sendStatus(200);
  }
  catch (error) {
    res.sendStatus(500);
    return console.log('error', error);
  }
  finally {
    console.log('Message Posted')
  }

})

io.on('connection', () => {
  console.log('a user is connected')
})

mongoose.connect(dbUrl).then(() => { console.log(`Mongo Connected`) }).catch((e) => { console.log(e) });

var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
