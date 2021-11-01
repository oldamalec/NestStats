import {initializeApp} from 'firebase/app'
import {getFirestore, collection, getDocs} from "firebase/firestore/lite";

// Your web app's Firebase configuration
const firebaseConfig = {
    // TODO set up
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app);

async function getData(col, /* TODO range, */ mapper) {
    const data = await getDocs(collection(db, col));
    const ret = [];
    data.docs.forEach(doc => {
        ret.push({
            x: new Date(doc.id).getTime(),
            y: mapper(doc.data())
        });
    });
    return ret;
}

async function getTemperature() {
    return await getData('temperature', v => v.ambientTemperatureCelsius);
}

async function getHumidity() {
    return await getData('humidity', v => v.ambientHumidityPercent);
}

async function getHvac() {
    const data = await getData('hvac', v => v.status)
    const ret = [];
    data.forEach(el => {
        if (el.y === 'HEATING') {
            ret.push({
                x: el.x,
                y: 22
            })
        } else {
            ret.push({
                x: el.x,
                y: 22
            }, {
                x: el.x + 1,
                y: null
            })
        }
    });
    return ret;
}

export {getTemperature, getHumidity, getHvac};
