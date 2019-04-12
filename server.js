const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const knex = require('knex');
const enableWs = require('express-ws');
const app = express();
enableWs(app);
app.use(bodyParser.json());

const db = knex({
    client: 'pg',
    connection: {
        host: 'postgresql://postgresql:5432/',
        user: "userRW3",
        password: 'SoroQ2jQtYbCCHwU',
        database: 'exigency'
    }
});
// app.use(cors());
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

let successObject = {
  response:"arre londeee"
};

app.get('/', (req, res) => {

    res.send("success");
});

let localUser ={
  email:'a',
  password:'a'
};


app.ws('/user', (ws, req) => {

  ws.on('message', msg => {
    let message = JSON.parse(msg);
    const {
        action
    } = message;
    console.log(message);
    switch(action){
      case 'signin':
      const {email, password} = message;
      console.log(email, password);
      if (email == localUser.email && password == localUser.password){
        ws.send( JSON.stringify({
          action:'signinResponse',
          status:'success',
          name:"Gawaar",
          details:"empty for now"
        }));
      }
      else ws.send(JSON.stringify( {
        action:'signinResponse',
        status:'fail',
      }));
      // db.select('*').from('users').where({
      //     email: email
      // }).then(user => {
      //     console.log('user quer', user);
      //      if (user.length)
      //          res.json(user[0]);
      //      else res.status(400).json('user not found')
      //})

      break;
      default:console.log('unkonwn action', action);
    }

  })

  ws.on('close', () => {
    console.log('WebSocket user was closed');
  })

});
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3006;

app.listen(port,ip, () => {
  console.log(`Hello Gang, Websockets Server Running on PORT ${port}`);
})
