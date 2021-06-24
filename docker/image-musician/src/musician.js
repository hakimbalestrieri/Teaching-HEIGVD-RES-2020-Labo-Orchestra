/**
 * @file musician.js
 * @authors Alexis Allemann & Hakim Balestrieri
 * @date 25.06.2021
 * @brief This program simulates a musician wich play some sounds on a multicast group.
          Others programs can join the group and receive the sounds. The sounds are transported
          in JSON payloads with the following format :
          {"uuid" : "'9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'", timestamp":1394656712850,"sound":"ti-ta-ti"}
          Usage : to start a musician, type the following command in a terminal
          (of course, you can run several musicians in parallel and observe that all
          sounds are transmitted via the multicast group): node musician.js instrument
 */

// Libraries imports
const dgram = require("dgram"); // Standard Node.js module to work with UDP
const settings = require("./settings"); // Program settings values
const { v4: uuidv4 } = require("uuid");

// Create sockets
const udp = dgram.createSocket("udp4");

// Create instruments sounds dictionnary
const map = new Map();
map.set("piano", "ti-ta-ti");
map.set("trumpet", "pouet");
map.set("flute", "trulu");
map.set("violin", "gzi-gzi");
map.set("drum", "boum-boum");

/**
 * Get the sound played by an instrument
 * @param instrument to get the sound played
 * @returns the sound played by the given instrument
 */
function getSound(instrument) {
  // If the instrument has not been found, terminate process
  if (!map.has(instrument)) process.exit(1);

  // Instrument exists, return it sound
  return map.get(instrument);
}

/**
 * Musician class
 * @param instrument played by the musician
 */
function Musician(instrument) {
  this.uuid = uuidv4();
  this.sound = getSound(instrument);

  // Simulating a sound played by the musician on the instrument
  Musician.prototype.playSound = function () {
    let sound = {
      uuid: this.uuid,
      timestamp: Date.now(),
      sound: this.sound,
    };
    let payload = JSON.stringify(sound);

    // encapsulate the payload in a UDP datagram, which we publish on the multicast address
    message = new Buffer.from(payload);
    udp.send(
      message,
      0,
      message.length,
      settings.UDP_PORT,
      settings.MULTICAST_ADDRESS,
      function () {
        console.log(
          "Sending payload: " + payload + " via port " + udp.address().port
        );
      }
    );
  };

  // take and send a sound every seconds
  setInterval(this.playSound.bind(this), 1000);
}

// Reading instrument to play from program arguments
let instrument = process.argv[2];

// Start
new Musician(instrument);
