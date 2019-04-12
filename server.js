const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const knex = require('knex');
const enableWs = require('express-ws');
const app = express();
enableWs(app);
app.use(bodyParser.json());
// app.use(cors());
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

let successObject = {
  response:"arre londeee"
};

app.get('/', (req, res) => {

    res.send("success");
});


app.ws('/user', (ws, req) => {

  ws.on('message', msg => {
    console.log(msg);
      ws.send(JSON.stringify(successObject));
  })

  ws.on('close', () => {
    console.log('WebSocket user was closed');
  })

});
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3006;

app.listen(port,ip, () => {
  console.log(`Hello Gang, Websockets Server Running on PORT ${port}`);
})
