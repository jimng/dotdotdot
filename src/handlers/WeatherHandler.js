import axios from 'axios';

import AbstractHandler from './AbstractHandler';

import ResponseText from '../constants/ResponseText';

const HK = 'HONGKONG';
const LUX = 'Luxemburg';

const CELSIUS_OFFSET = 273.15;

export default class WeatherHandler extends AbstractHandler {
    async getReply(msg, match) {
        const hkData = (await axios('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                q: HK,
                appid: process.env.OPEN_WEATHER_API_KEY
            }
        })).data;

        const luxData = (await axios('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                q: LUX,
                appid: process.env.OPEN_WEATHER_API_KEY
            }
        })).data;

        const hkText = ResponseText.WEATHER.BODY
            .replace('{t}', Math.round(hkData.main.temp - CELSIUS_OFFSET))
            .replace('{fl}', Math.round(hkData.main.feels_like - CELSIUS_OFFSET))
            .replace('{lt}', Math.round(hkData.main.temp_min - CELSIUS_OFFSET))
            .replace('{ht}', Math.round(hkData.main.temp_max - CELSIUS_OFFSET))
            .replace('{h}', Math.round(hkData.main.humidity))

        const luxText = ResponseText.WEATHER.BODY
            .replace('{t}', Math.round(luxData.main.temp - CELSIUS_OFFSET))
            .replace('{fl}', Math.round(luxData.main.feels_like - CELSIUS_OFFSET))
            .replace('{lt}', Math.round(luxData.main.temp_min - CELSIUS_OFFSET))
            .replace('{ht}', Math.round(luxData.main.temp_max - CELSIUS_OFFSET))
            .replace('{h}', Math.round(luxData.main.humidity))

        return `${ResponseText.WEATHER.HK_HEADER}\n${hkText}\n\n${ResponseText.WEATHER.LUX_HEADER}\n${luxText}`;
    }
}
