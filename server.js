const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
// const knex = require('knex');
const enableWs = require('express-ws');
const app = express();
enableWs(app);
app.use(bodyParser.json());

// const db = knex({
//     client: 'pg',
//     connection: {
//         host: 'postgresql://postgresql:5432/',
//         user: "userRW3",
//         password: 'SoroQ2jQtYbCCHwU',
//         database: 'exigency'
//     }
// });
// app.use(cors());
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.get('/', (req, res) => {
    res.send("success");
});

let localUser = {
    email: 'a',
    password: 'a',
    name:'Shibe'
};

let localDriver = {
    number:'8050738265',
    name:'Supada',
    email:'b',
    password:'b'

};
let sendWSData = (ws, data)=>{
    if(ws!=null){
        if (ws.readyState != ws.CLOSED){
            ws.send(JSON.stringify(data));
        }
    }
}

let wsUser = null;
let wsAmbulance = null;
let wsHospital =null;
let gyroData = [];
let getGyroInterval = null;
let gyroRequest = {
    action: 'giveGyro'
};
let predictorInterval = null;

app.ws('/user', (ws, req) => {
    wsUser = ws;
    ws.on('message', msg => {
        let message = JSON.parse(msg);
        const {
            action
        } = message;
        console.log('user recieved this:', message);
        if (action === 'requestSignin') {
            const {email, password} = message;
            console.log(email, password);
            if (email === localUser.email && password === localUser.password) {
                let responseObj = {
                    action: 'signinResponse',
                    status: 'success',
                    email: email,
                    details: "empty for now"
                };
                sendWSData(ws, responseObj);
            } else {
                sendWSData(ws, {
                    action: 'signinResponse',
                    status: 'fail',
                })
            }
        } else if (action === 'requestAmbulance') {
            let {latitude, longitude, email, forWhom} = message;
            console.log('ambulance requested', message);
            if (wsAmbulance != null) {
                    wsAmbulance.requestAmbulance({
                        latitude,
                        longitude,
                        email,
                        forWhom
                    });
            }
        } else if (action === 'gyroResponse'){
            let {x,y,z} = message;
            let magnitude = Math.sqrt(x * x + y * y + z * z);
            console.log(magnitude);
            gyroData.push(magnitude);
        } else if (action === 'gyroReady'){
            console.log('gyroready');
            getGyroInterval = setInterval(() => {
                if (ws.readyState != ws.CLOSED) {
                    ws.send(JSON.stringify(gyroRequest));
                }
            }, 100);
        }
        else {
            console.log('unknown action', action);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket user was closed');
        wsUser = null;
    })

});

app.ws('/ambulance', (ws, req) => {
    wsAmbulance = ws;
    wsAmbulance.requestAmbulance = (request) => {
        console.log("ambulance request received," , request);
        let distressObject  = {
            action:'requestAmbulance',
            latitude: request.latitude,
            longitude:request.longitude,
            email:request.email
        };
        sendWSData(ws, distressObject);

    };
    ws.on('message', msg => {
        let message = JSON.parse(msg);
        const {
            action
        } = message;
        console.log('ambulance received this:', message);
        if (action === 'ambulanceResponse') {
            let {status }= message;
            if(status === 'success'){
                let successObj = {
                    action:'ambulanceResponse',
                    status:'success',
                    driverNumber:localDriver.number,
                    driverName:localDriver.name,
                    eta:'5'
                };
                console.log('ambulance okay, sending  to user');
                //hospital send here
                sendWSData(wsUser, successObj);
            }
        } else if (action === 'requestSignin'){
            const {email, password} = message;
            console.log(email, password);
            if (email === localDriver.email && password === localDriver.password) {
                let responseObj = {
                    action: 'signinResponse',
                    status: 'success',
                    email: email,
                    details: "empty for now"
                };
                sendWSData(ws, responseObj);

            } else {
                sendWSData(ws, {
                    action: 'signinResponse',
                    status: 'fail',
                })
            }
        }else if(action === 'locationResponse'){
            console.log('got location');
            let {latitude, longitude} = message;
            sendWSData(wsUser, {
                action:'driverLocation',
                latitude:latitude,
                longitude:longitude
            })
        }
        else {
            console.log('unknown action', action);
        }
    });
    ws.on('close', () => {
        console.log('WebSocket ambulance was closed');
        wsAmbulance = null;
    })

});


let sendGyroData = (ws) => {
    if (gyroData.length > 300) {
        gyroData = gyroData.slice(gyroData.length - 60, gyroData.length);
    }
    let sendObj = {
        data: gyroData.slice(gyroData.length - 30, gyroData.length)
    };
    if (gyroData.length >= 30) {
        sendWSData(ws, sendObj);
    }
};

app.ws('/predictor', (ws, req) => {

    ws.on('message', msg => {

        let predObj = JSON.parse(msg);
        if (predObj.action === 'ready') {
            predictorInterval = setInterval(() => {
                sendGyroData(ws);
            }, 1000);
        } else if (predObj.action === 'prediction') {
            let {
                prediction
            } = predObj;
            console.log('prediction', prediction);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket predictor was closed');
        clearInterval(predictorInterval);
        predictorInterval = null;
    })
});

app.listen(port, ip, () => {
    console.log(`Hello Gang, Websockets Server Running on PORT ${port}`);
});
