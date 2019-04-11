const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const enableWs = require('express-ws');
const app = express();
enableWs(app);
app.use(bodyParser.json());
app.use(cors());

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

app.listen(process.env.PORT || 3006, () => {
  console.log(`Hello Gang, Websockets Server Running on PORT ${process.env.PORT||3006}`);
})
