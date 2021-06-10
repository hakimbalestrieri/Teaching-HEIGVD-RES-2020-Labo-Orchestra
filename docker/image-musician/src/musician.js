/*
 This program simulates a musician wich play some sounds on a multicast group.
 Others programs can join the group and receive the sounds. The sounds are transported
 in JSON payloads with the following format :
    {"uuid" : "'9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'", timestamp":1394656712850,"sound":"ti-ta-ti"}
 Usage : to start a musician, type the following command in a terminal
 		(of course, you can run several musicians in parallel and observe that all
       	sounds are transmitted via the multicast group):
   node musician.js instrument
*/

var protocol = require("./orchestra-protocol");

/*
 * Using a standard Node.js module to work with UDP
 */
var dgram = require("dgram");

/*
 * Using a standard Node.js module to work with UUID
 */
const { v4: uuidv4 } = require("uuid");

/*
 * Creating a datagram socket. We will use it to send our UDP datagrams
 */
var s = dgram.createSocket("udp4");

/**
 * Get the sound played by an instrument
 * @param instrument to get the sound played
 * @returns the sound played by the given instrument
 */
function getSound(instrument) {
  switch (instrument) {
    case "piano":
      return "ti-ta-ti";
    case "trumpet":
      return "pouet";
    case "flute":
      return "trulu";
    case "violin":
      return "gzi-gzi";
    case "drum":
      return "boum-boum";
    default:
      return "";
  }
}

/**
 * Defining a javascript class for our musician.
 * @param instrument played by the musician
 */
function Musician(instrument) {
  this.uuid = uuidv4();
  this.sound = getSound(instrument);

  /*
   * Simulating a sound played by the musician on the instrument. That is something that
   * we implement in a class method (via the prototype)
   */
  Musician.prototype.playSound = function () {
    var sound = {
      uuid: this.uuid,
      timestamp: Date.now(),
      sound: this.sound,
    };
    var payload = JSON.stringify(sound);

    /*
     * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
     * the multicast address. All subscribers to this address will receive the message.
     */
    message = new Buffer.from(payload);
    s.send(
      message,
      0,
      message.length,
      protocol.PROTOCOL_PORT,
      protocol.PROTOCOL_MULTICAST_ADDRESS,
      function () {
        console.log(
          "Sending payload: " + payload + " via port " + s.address().port
        );
      }
    );
  };

  /*
   * Let's take and send a sound every seconds
   */
  setInterval(this.playSound.bind(this), 1000);
}

/*
 * Reading instrument to play from program arguments
 * Some error handling wouln't hurt here...
 */
var instrument = process.argv[2];

/*
 * Creating a new musician - the instrument played will
 * be initiated within the constructor
 */
new Musician(instrument);
