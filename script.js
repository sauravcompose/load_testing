import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
    stages: [
        { duration: '5m', target: 5 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
        { duration: '30m', target: 10 },
        { duration: '30m', target: 25 }, // stay at 100 users for 30 minutes
        { duration: '5m', target: 0 }, // ramp-down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'],
    },
    summaryTrendStats: ['avg', 'p(95)', 'p(99)', 'med', 'min', 'max'],
};

export default function () {
    let response = http.get('https://www.bikeexchange.de/sitemap.xml');

    let xmlData = response.body;
    let locMatches = xmlData.match(/<loc>(.*?)<\/loc>/g);

    let i = 0;

    locMatches.map(match => {
        const url = match.replace(/<\/?loc>/g, '').replace('https://www.bikeexchange.de/', 'https://d1iwqyn9u48vu3.cloudfront.net/api/cms-app/v1/Page?urlSlug=%2F');
        let res = http.get(url, {
            headers: {
                'accept': 'application/json',
                'vertical': 'de',
                'locale': 'de-DE',
            },
        });

        check(res, { "status was 200": (r) => r.status == 200 });
        sleep(1);
    });
}