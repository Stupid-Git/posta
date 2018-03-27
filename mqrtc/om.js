var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Omqtt( param )
{
    mqttServer = param.mqttServer;
    topic_sendAnswer = param.topic_sendAnswer;
    topic_makeOffer  = param.topic_makeOffer;

    this.ready = false;

    //console.log('===== START: Omqtt =====')
    // call the super constructor to initialize `this`
    EventEmitter.call(this);
    // your own initialization of `this` follows here

    var mqtt = require('mqtt'); //var mqtt = require('./')
    //var mqtt_client = mqtt.connect('mqtt://test.mosquitto.org')
    //var mqtt_client = mqtt.connect('mqtt://ocn.cloudns.org')
    //var mqtt_client = mqtt.connect('mqtt://broker.hivemq.com');
    //mqtt_client.end();
    var mqtt_client = mqtt.connect( mqttServer )

    var that = this;

    mqtt_client.subscribe(topic_sendAnswer, (err, granted) => {
        if(err)
            console.log('mqtt_client.subscribe(sendAnswer) FAILED')
        else {
            console.log('mqtt_client.subscribe(sendAnswer) OK')
            that.ready = true;
        }
    })

    mqtt_client.on('message',
        function(topic, answer) {
            that.emit('gotAnswer', JSON.parse(answer) );
        }
    );

    this.sendOffer = function(offer) { // PUBLIC
        mqtt_client.publish(topic_makeOffer, JSON.stringify(offer));
    }
   
}

// Declare that your class should use EventEmitter as its prototype.
// This is roughly equivalent to: Master.prototype = Object.create(EventEmitter.prototype)
util.inherits(Omqtt, EventEmitter);

module.exports = Omqtt;
//module.exports = new Omqtt();
