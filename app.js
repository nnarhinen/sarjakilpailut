"use strict";

var express = require('express'),
    app = express(),
    axios = require('axios'),
    sprintf = require('sprintf-js').sprintf,
    _ = require('underscore'),
    nunjucks = require('nunjucks');


nunjucks.configure('views', {
  autoescpe: true,
  express: app
});


var competitionSeries = {
  amatoorisarja: {
    competitionIds: {
      '151342': 'Myrkky 18.-19.4',
      '153957': 'Laakso 1.-3.5',
      '155929': 'Ypäjä 8.-10.5',
      '157533': 'Turku 15.-17.5',
      '159378': 'Jyväskylä 23.-24.5',
      '163231': 'Ypäjä 9.-14.6',
      '163329': 'Mäntyharju 14.6.'
    },
    pointMatrix: [20,18,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,1,1],
    significantCompetitions: 6
  },
  junioricup: {
    pointMatrix: [20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    significantCompetitions: 5,
    competitionIds: {
      '151338': 'Myrkky 18.-19.4',
      '153956': 'Laakso 1.-3.5',
      '157822': 'Pony Event 16.-17.6',
      '159116': 'Jyväskylä 23.-24.5',
      '161948': 'Iisalmi 6.-7.6',
      '163230': 'Ypäjä 9.-14.6'
    }
  },
  gp: {
    competitionIds: {
      '156166': 'Ypäjä 8.-10.5',
      '158763': 'Korpikylä 21.-24.5.'
    },
    pointMatrix: [20,18,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,1,1],
    significantCompetitions: 3,
    oneHorseOnly: true
  }
};

_.keys(competitionSeries).map((path) => {
  var {competitionIds, pointMatrix, significantCompetitions, oneHorseOnly} = competitionSeries[path];
  app.get('/data/' + path, (req, res, next) => {

    Promise.all(_.keys(competitionIds).map((id) => {
      return axios.get(sprintf('http://online.equipe.com/api/v1/class_sections/%s/results.json', id)).then((res) => {
        var riders = {};
        return [id, res.data.filter((one) => {
          if (oneHorseOnly && riders[one.rider_id]) return false;
          riders[one.rider_id] = true;
          return one.results[0].status !== 'eliminated' && Object.keys(riders).length <= pointMatrix.length;
        }).map((one, rank) => _.extend(_.pick(one, 'rider_name', 'horse_name', 'club_name', 'rank', 'result_preview'), {points: pointMatrix[rank]}))];
      }); 
    })).then((data) => {
      var ret = _.chain(data)
      .map((one) => one[1].map((result) => _.extend(result, {competition_id: one[0], competition_name: competitionIds[one[0]]})))
      .flatten()
      .groupBy((one) => [one.rider_name, one.horse_name, one.club_name])
      .pairs()
      .map((one) => {
        var results = one[1];
        return _.extend(_.pick(results[0], 'rider_name', 'horse_name', 'club_name'), {total_points: _.last(results.map((one) => one.points).sort(), significantCompetitions).reduce((memo, one) => memo + one, 0)}, {
          competitions: results.map((one) => _.pick(one, 'competition_id', 'competition_name', 'points', 'result_preview', 'rank'))
        });
      })
      .sortBy('total_points')
      .reverse()
      .value();
      res.send({
        competitions: competitionIds,
        standings: ret
      });
    }).catch((err) => console.error(err));
  });
});

app.use('/static', express.static('static'));

app.get('/*', (req, res) => res.render('index.html'));

module.exports = app;
