import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
    vus: 10,
    duration: '100m',
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
    summaryTrendStats: ['avg', 'p(95)', 'p(99)', 'med', 'min', 'max'],
};


export default function () {
    let response = http.get('https://www.bikeexchange.de/sitemap.xml');

    let xmlData = response.body;
    let locMatches = xmlData.match(/<loc>(.*?)<\/loc>/g);

    let i = 0;
    const arr = [];
    let tempArr = [];

    locMatches.map(match => {
        const url = match.replace(/<\/?loc>/g, '').replace('https://www.bikeexchange.de/', 'https://d1iwqyn9u48vu3.cloudfront.net/api/cms-app/v1/Page?urlSlug=%2F');

        if (tempArr.length == 10) {
            arr.push(tempArr);
            tempArr = [];
        } else {
            tempArr.push({
                method: 'GET',
                url,
                params: {
                    headers: {
                        'accept': 'application/json',
                        'vertical': 'de',
                        'locale': 'de-DE',
                    },
                },
            });
        }
    });

    for (let urls of arr) {
        const res = http.batch(urls);
        console.log(++i);
        check(res, {
            'All responses are 200': (res) => res.every((r) => r.status === 200),
        });
        sleep(1);
    }
}