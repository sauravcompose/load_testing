const xml2js = require('xml2js');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const url = 'https://www.bikeexchange.de/sitemap.xml';

axios.get(url)
    .then(response => {
        const urlData = response.data;
        let urlList;

        xml2js.parseString(urlData, (parseErr, result) => {
            if (parseErr) {
                console.log(parseErr);
                return;
            }
            urlList = result;
        });

        let records = urlList.urlset.url.slice(0, 10).map(i => {
            return { url: i.loc[0].replace(/<\/?loc>/g, '').replace('https://www.bikeexchange.de/', 'https://d1iwqyn9u48vu3.cloudfront.net/api/cms-app/v1/Page?urlSlug=%2F') }
        });

        const csvWriter = createCsvWriter({
            path: './urls.csv',
            header: [
                { id: 'url', title: 'URL' }
            ]
        });

        csvWriter.writeRecords(records)
            .then(() => {
                console.log('...Done');
            });
    })
    .catch(error => {
        console.error('Error fetching XML:', error.message);
    })