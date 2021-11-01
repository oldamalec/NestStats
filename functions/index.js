const functions = require("firebase-functions");
const admin = require("firebase-admin");

const traits = {
  temperature: 'sdm.devices.traits.Temperature',
  humidity: 'sdm.devices.traits.Humidity',
  setPoint: 'sdm.devices.traits.ThermostatTemperatureSetpoint',
  mode: 'sdm.devices.traits.ThermostatMode',
  eco: 'sdm.devices.traits.ThermostatEco',
  hvac: 'sdm.devices.traits.ThermostatHvac'
}

admin.initializeApp();
const firestore = admin.firestore;

exports.handleEvent = functions.https.onRequest((request, response) => {

  const data = JSON.parse(Buffer.from(request.body.message.data, 'base64').toString());

  if (data.resourceUpdate === undefined) {
    functions.logger.info(data);
  } else {
    const resource = data.resourceUpdate;
    for (const trait of Object.keys(resource.traits)) {
      switch (trait) {
        case traits.temperature:
          firestore()
            .collection('temperature')
            .doc(data.timestamp)
            .set({
              resource: resource.name,
              ...resource.traits[trait]
            });
          break;
        case traits.humidity:
          firestore()
            .collection('humidity')
            .doc(data.timestamp)
            .set({
              ...resource.traits[trait]
            });
          break;
        case traits.setPoint:
          firestore()
            .collection('setPoint')
            .doc(data.timestamp)
            .set({
              ...resource.traits[trait]
            });
          break;
        case traits.mode:
          continue;
        case traits.eco:
          firestore()
            .collection('eco')
            .doc(data.timestamp)
            .set({
              mode: resource.traits[trait].mode
            });
          break;
        case traits.hvac:
          firestore()
            .collection('hvac')
            .doc(data.timestamp)
            .set({
              ...resource.traits[trait]
            });
          break;
        default:
          firestore()
            .collection('other')
            .doc(data.timestamp)
            .set({
              trait: trait,
              resource: resource.name,
              ...resource.traits[trait]
            });
      }
    }
  }

  response.status(200);
  response.send();
});
