const uxsFbPage = require('./../uxsfbpage/uxsfbpage');

const FB = require('fb');
const express = require('express');
const scheduler = require('node-schedule');
const app = express();

const port = process.env.PORT;
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const UXSOC_CHAPMANU_TOKEN = process.env.UXSOC_CHAPMANU_TOKEN;
var url = ''

FB.setAccessToken(UXSOC_CHAPMANU_TOKEN);

app.get('/', (req, res) => {
  res.send("Hello, friend. I'm running just fine.");
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
  try {

    // Get the latest URL posted by UXSoc and the latest URL posted by UXSocChapmanU
    uxsFbPage.getLatestUrl('uxsocchapmanu', APP_ID, APP_SECRET, (errorMsg, results) => {
      if (errorMsg) {
        console.log(errorMessage);
      } else {
        console.log(results);
        // If the link is not a shared post on facebook or gif
        if (url !== results.link && !(results.link.endsWith('gif') || results.link.includes('facebook.com'))) {
          url = results.link;
          uxsFbPage.getLatestUrl('uxsoc', APP_ID, APP_SECRET, (errorMsg, results) => {
            if (errorMsg) {
              console.log(errorMessage);
            } else {
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
                console.log('Latest URL between both pages is still the same.');
              }
            }
          });
        }
        console.log(url);
      }
    });

    // Schedule a job every 15 minutes
    var j = scheduler.scheduleJob('*/15 * * * *', () => {
      uxsFbPage.getLatestUrl('uxsoc', APP_ID, APP_SECRET, (errorMsg, results) => {
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
