const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const knex = require('knex');
const enableWs = require('express-ws');
const app = express();
enableWs(app);
app.use(bodyParser.json());
// app.use(cors());

let successObject = {
  response:"arre londeee"
};

app.ws('/user', (ws, req) => {

  ws.on('message', msg => {
      ws.send(JSON.stringify(successObject));
  })

  ws.on('close', () => {
    console.log('WebSocket user was closed');
  })

});
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3006;

app.listen(server_port, () => {
  console.log(`Hello Gang, Websockets Server Running on PORT ${server_port}`);
})
