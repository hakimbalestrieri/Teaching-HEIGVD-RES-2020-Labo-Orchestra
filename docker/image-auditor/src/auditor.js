/**
 * @file auditor.js
 * @authors Alexis Allemann & Hakim Balestrieri
 * @date 25.06.2021
 * @brief This program simulates a "data collection auditor", which joins a multicast
 *        group in order to receive sounds produced by musicians.
 *        The sounds are transported in json payloads with the following format:
 *        {"uuid" : "'9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'", timestamp":1394656712850,"sound":"ti-ta-ti"}
 *        Usage: to start an auditor, use the following command in a terminal : node auditor.js
 */

// Libraries imports
const dgram = require("dgram"); // Standard Node.js module to work with UDP
const net = require("net"); // Standard Node.js module to work with TCP
const moment = require("moment"); // To work with dates
const settings = require("./settings"); // Program settings values

// Create sockets
const udp = dgram.createSocket("udp4");
const tcp = net.createServer();

// Map to store active musicians
const musicians = new Map();

// Listen to UDP multicast group
udp.on("listening", () => {
  udp.addMembership(settings.MULTICAST_ADDRESS);
});

// Capture and process UDP messages sent by musicians
udp.on("message", (message) => {
  let musician = JSON.parse(message);

  // Test if musician has already played a sound before to update last sound played date
  if (musicians.has(musician.uuid)) {
    musicians.get(musician.uuid).lastSound = moment().format();
    console.log("Updated musician " + musician.uuid);
  } else {
    // Musician does not exists
    musicians.set(musician.uuid, {
      uuid: musician.uuid,
      instrument: musician.instrument,
      activeSince: moment().format(),
      lastUpdate: moment().format(),
    });
    console.log("Added musician " + musician.uuid);
  }
});

// On client connection, return active musician list
tcp.on("connection", (socket) => {
  let orchestra = [];

  // Browse each musician
  musicians.forEach((musician, uuid) => {
    // Test if current musician is active
    if (
      moment()
        .subtract(settings.ACTIVE_TIME_IN_SECONDS, "s")
        .diff(musician.lastSound) <= 0
    ) {
      orchestra.push({
        uuid: uuid,
        instrument: musician.instrument,
        activeSince: musician.activeSince,
      });
    } else {
      // Remove musician from active musicians
      musicians.delete(uuid);
      console.log("Removed musician " + uuid);
    }
  });

  // Write active musician data
  socket.write(JSON.stringify(orchestra) + "\n");
  socket.end;
});

// Start
udp.bind(settings.UDP_PORT);
tcp.listen(settings.TCP_PORT);
