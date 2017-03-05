const uxsFbPage = require('./../uxsfbpage/uxsfbpage');

const FB = require('fb');
const express = require('express');
const scheduler = require('node-schedule');

var app = express();
const port = process.env.PORT;

var url = '';
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const UXSOC_CHAPMANU_TOKEN = process.env.UXSOC_CHAPMANU_TOKEN;

FB.setAccessToken(UXSOC_CHAPMANU_TOKEN);

app.listen(3000, () => {
  console.log('Started on port 3000');
  try {

    // Get the latest URL posted by UXSoc (assumed already posted)
    uxsFbPage.getLatestUrl(APP_ID, APP_SECRET, (errorMsg, results) => {
      if (errorMsg) {
        console.log(errorMessage);
      } else {
        console.log(results);
        if (url !== results.link && !(results.link.endsWith('gif') || results.link.includes('facebook.com'))) {
          url = results.link;
        }
        console.log(url);
      }
    });

    // Schedule a job every 15 minutes
    var j = scheduler.scheduleJob('*/15 * * * *', () => {
      uxsFbPage.getLatestUrl(APP_ID, APP_SECRET, (errorMsg, results) => {
        if (errorMsg) {
          console.log(errorMessage);
        } else {
          console.log("Firing cron job");
          // If the latest url is not the same then post to the page (excluding gif or facebook.com because those are chapter specific shares)
          if (url !== results.link && !(results.link.endsWith('gif') || results.link.includes('facebook.com'))) {
            url = results.link;
            FB.api('feed', 'post', { link: results.link }, (res) => {
              if (!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
              }
              console.log('Post Id: ' + res.id);
            });
          } else {
            console.log('Latest URL is still the same.');
          }
        }
      });
    });

  } catch (err) {
    console.log('Error: ' + err.message);
  }
});
