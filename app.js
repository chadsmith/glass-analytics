var util = require('util'),
  express = require('express'),
  path = require('path'),
  googleapis = require('googleapis'),
  moment = require('moment'),
  settings = {
    server: {
      hostname: 'mktgdept.com',
      port: '5555'
    },
    google: {
      client_id: '000000000000.apps.googleusercontent.com',
      client_secret: 'bbbbbbbbbbbbbbbbbbbbbbbb'
    }
  },
  numberFormat = function(num) {
    var parts = num.toString().split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? '.' + parts[1] : '');
  },
  template = function(title, data) {
    return '<article><section><table class="text-auto-size"><tbody><tr><td>Visits</td><td class="align-right">' + numberFormat(data.visits) + '</td><td class="' + (data.change.visits > 0 ? 'green' : 'red') + ' align-right">' + numberFormat(data.change.visits) + '%</td></tr><tr><td>Pageviews</td><td class="align-right">' + numberFormat(data.pageviews) + '</td><td class="' + (data.change.pageviews > 0 ? 'green' : 'red') + ' align-right">' + numberFormat(data.change.pageviews) + '%</td></tr></tbody></table></section><footer><p class="yellow">' + title + '</p></footer></article>';
  },
  updateAnalytics = function(webPropertyId, itemId, isPinned) {
    googleapis.discover('mirror', 'v1').discover('analytics', 'v3').execute(function(err, client) {
      client.analytics.management.profiles.list({ accountId: webPropertyId.match(/UA\-(\d+)\-\d+/)[1], webPropertyId: webPropertyId }).withAuthClient(oauth2Client).execute(function(err, results) {
        console.log('client.analytics.management.profiles.list', util.inspect(results));
        var property = {
            id: results.items[0].id,
            name: results.items[0].name
          };
        client
          .newBatchRequest()
          .add(client.analytics.data.ga.get({ ids: 'ga:' + property.id, 'start-date': moment().format('YYYY-MM-DD'), 'end-date': moment().format('YYYY-MM-DD'), metrics: 'ga:visits,ga:pageviews' }))
          .add(client.analytics.data.ga.get({ ids: 'ga:' + property.id, 'start-date': moment().subtract('days', 1).format('YYYY-MM-DD'), 'end-date': moment().subtract('days', 1).format('YYYY-MM-DD'), metrics: 'ga:visits,ga:pageviews' }))
          .add(client.analytics.data.ga.get({ ids: 'ga:' + property.id, 'start-date': moment().subtract('days', 2).format('YYYY-MM-DD'), 'end-date': moment().subtract('days', 2).format('YYYY-MM-DD'), metrics: 'ga:visits,ga:pageviews' }))
          .add(client.analytics.data.ga.get({ ids: 'ga:' + property.id, 'start-date': moment().subtract('days', 7).format('YYYY-MM-DD'), 'end-date': moment().subtract('days', 1).format('YYYY-MM-DD'), metrics: 'ga:visits,ga:pageviews' }))
          .add(client.analytics.data.ga.get({ ids: 'ga:' + property.id, 'start-date': moment().subtract('days', 14).format('YYYY-MM-DD'), 'end-date': moment().subtract('days', 8).format('YYYY-MM-DD'), metrics: 'ga:visits,ga:pageviews' }))
          .add(client.analytics.data.ga.get({ ids: 'ga:' + property.id, 'start-date': moment().subtract('days', 30).format('YYYY-MM-DD'), 'end-date': moment().subtract('days', 1).format('YYYY-MM-DD'), metrics: 'ga:visits,ga:pageviews' }))
          .add(client.analytics.data.ga.get({ ids: 'ga:' + property.id, 'start-date': moment().subtract('days', 60).format('YYYY-MM-DD'), 'end-date': moment().subtract('days', 31).format('YYYY-MM-DD'), metrics: 'ga:visits,ga:pageviews' }))
          .withAuthClient(oauth2Client)
          .execute(function(err, results) {
            var data = {
                today: {
                  visits: results[0] ? parseInt(results[0].rows[0][0]) : 0,
                  pageviews: results[0] ? parseInt(results[0].rows[0][1]) : 0
                },
                yesterday: {
                  visits: results[1] ? parseInt(results[1].rows[0][0]) : 0,
                  pageviews: results[1] ? parseInt(results[1].rows[0][1]) : 0
                },
                two_days_ago: {
                  visits: results[2] ? parseInt(results[2].rows[0][0]) : 0,
                  pageviews: results[2] ? parseInt(results[2].rows[0][1]) : 0
                },
                week: {
                  visits: results[3] ? parseInt(results[3].rows[0][0]) : 0,
                  pageviews: results[3] ? parseInt(results[3].rows[0][1]) : 0
                },
                two_weeks_ago: {
                  visits: results[4] ? parseInt(results[4].rows[0][0]) : 0,
                  pageviews: results[4] ? parseInt(results[4].rows[0][1]) : 0
                },
                month: {
                  visits: results[5] ? parseInt(results[5].rows[0][0]) : 0,
                  pageviews: results[5] ? parseInt(results[5].rows[0][1]) : 0
                },
                two_months_ago: {
                  visits: results[6] ? parseInt(results[6].rows[0][0]) : 0,
                  pageviews: results[6] ? parseInt(results[6].rows[0][1]) : 0
                }
              },
              card = {
                sourceItemId: webPropertyId,
                htmlPages: [],
                isPinned: isPinned,
                menuItems: [
                  {
                    id: 'refresh',
                    action: 'CUSTOM',
                    values: [
                      {
                        displayName: 'Refresh',
                        iconUrl: 'http://' + settings.server.hostname + ':' + settings.server.port + '/refresh.png'
                      }
                    ]
                  },
                  {
                    action: 'TOGGLE_PINNED'
                  },
                  {
                    action: 'DELETE'
                  }
                ]
              },
              result;
            if(data.yesterday.visits) {
              result = {
                visits: data.today.visits,
                pageviews: data.today.pageviews,
                change: {
                  visits: parseFloat((data.today.visits - data.yesterday.visits) / data.yesterday.visits * 100).toFixed(2),
                  pageviews: parseFloat((data.today.pageviews - data.yesterday.pageviews) / data.yesterday.pageviews * 100).toFixed(2)
                }
              };
              card.html = template(property.name, result);
              card.htmlPages.push(template('Today', result));
              if(data.two_days_ago.visits) {
                card.htmlPages.push(template('Yesterday', {
                  visits: data.yesterday.visits,
                  pageviews: data.yesterday.pageviews,
                  change: {
                    visits: parseFloat((data.yesterday.visits - data.two_days_ago.visits) / data.two_days_ago.visits * 100).toFixed(2),
                    pageviews: parseFloat((data.yesterday.pageviews - data.two_days_ago.pageviews) / data.two_days_ago.pageviews * 100).toFixed(2)
                  }
                }));
                if(data.two_weeks_ago.visits) {
                  card.htmlPages.push(template('Last Week', {
                    visits: data.week.visits,
                    pageviews: data.week.pageviews,
                    change: {
                      visits: parseFloat((data.week.visits - data.two_weeks_ago.visits) / data.two_weeks_ago.visits * 100).toFixed(2),
                      pageviews: parseFloat((data.week.pageviews - data.two_weeks_ago.pageviews) / data.two_weeks_ago.pageviews * 100).toFixed(2)
                    }
                  }));
                  if(data.two_months_ago.visits) {
                    card.htmlPages.push(template('Last Month', {
                      visits: data.month.visits,
                      pageviews: data.month.pageviews,
                      change: {
                        visits: parseFloat((data.month.visits - data.two_months_ago.visits) / data.two_months_ago.visits * 100).toFixed(2),
                        pageviews: parseFloat((data.month.pageviews - data.two_months_ago.pageviews) / data.two_months_ago.pageviews * 100).toFixed(2)
                      }
                    }));
                  }
                }
              }
              if(itemId)
                client.mirror.newRequest('mirror.timeline.update', { id: itemId }, card).withAuthClient(oauth2Client).execute(function(err, result) {
                  console.log('mirror.timeline.update', util.inspect(result));
                });
              else
                client.mirror.newRequest('mirror.timeline.insert', null, card).withAuthClient(oauth2Client).execute(function(err, result) {
                  console.log('mirror.timeline.insert', util.inspect(result));
                });
            }
          });
        });
    });
  },
  OAuth2Client = googleapis.OAuth2Client,
  oauth2Client,
  app = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
  if(!oauth2Client || !oauth2Client.credentials) {
    oauth2Client = new OAuth2Client(settings.google.client_id, settings.google.client_secret, 'http://' + settings.server.hostname + ':' + settings.server.port + '/oauth2callback');
    res.redirect(oauth2Client.generateAuthUrl({
      access_type: 'offline',
      approval_prompt: 'force',
      scope: [
        'https://www.googleapis.com/auth/glass.timeline',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/analytics.readonly'
      ].join(' ')
    }));
  }
  else {
    googleapis.discover('mirror', 'v1').discover('analytics', 'v3').execute(function(err, client) {
      client.mirror.withAuthClient(oauth2Client).newRequest('mirror.subscriptions.insert', null, {
        callbackUrl: 'https://mirrornotifications.appspot.com/forward?url=http://' + settings.server.hostname + ':' + settings.server.port + '/subcallback',
        collection: 'timeline'
      }).execute(function(err, result) {
        console.log('mirror.subscriptions.insert', util.inspect(result));
      });
      updateAnalytics('UA-XXXXX-X'); // add your site's ID here
    });
    res.send(200);
  }
});

app.get('/oauth2callback', function(req, res) {
  if(!oauth2Client) {
    res.redirect('/');
  }
  else {
    oauth2Client.getToken(req.query.code, function(err, tokens) {
      oauth2Client.credentials = tokens;
      res.redirect('/');
    });
  }
});

app.post('/subcallback', function(req, res) {
  res.send(200);
  console.log('/subcallback', util.inspect(req.body));
  if(req.body.operation == 'UPDATE' && req.body.userActions[0].type == 'CUSTOM')
    googleapis.discover('mirror', 'v1').execute(function(err, client) {
      client.mirror.timeline.get({ id: req.body.itemId }).withAuthClient(oauth2Client).execute(function(err, result) {
        console.log('mirror.timeline.get', util.inspect(result));
        updateAnalytics(result.sourceItemId, result.id, result.isPinned);
      });
    });
});

app.listen(settings.server.port);