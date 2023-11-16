import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
    vus: 10,
    duration: '60m',
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

    locMatches.map(match => {
        console.log(++i);
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