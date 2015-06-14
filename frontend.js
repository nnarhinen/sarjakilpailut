"use strict";
import { RouteHandler, Route, Link, Navigation  } from 'react-router';
import React from 'react';
import ReactRouter from 'react-router';
import { Table, Alert, Well, Navbar, Nav, DropdownButton, MenuItem } from 'react-bootstrap';
import axios from 'axios';


var App = React.createClass({
  mixins: [Navigation],
  onMenuSelect(key) {
    this.transitionTo(key);
  },
  render() {
    return (
      <div>
        <Navbar brand='Sarjakilpailutilanteet' inverse toggleNavKey={0} staticTop>
          <Nav right eventKey={0}>
            <DropdownButton eventKey={1} title='Kilpailut'>
              <MenuItem onSelect={this.onMenuSelect} eventKey='/amatoorisarja'>Amatöörisarja</MenuItem>
            </DropdownButton>
            <MenuItem onSelect={this.onMenuSelect} eventKey='/tietoja'>Info</MenuItem>
          </Nav>
        </Navbar>
        <div className="container">
          <RouteHandler />
        </div>
        <div className="container">
          <p style={{textAlign: 'center'}}>(c) Niklas Närhinen 2015</p>
        </div>
      </div>
    );
  }
});

var Amatoorisarja = React.createClass({
  componentDidMount() {
    axios.get('/data/amatoorisarja').then((resp) => {
      this.setState({
        data: resp.data,
        loading: false
      });
    }).catch(() => this.setState({error: true }));
  },
  getInitialState() {
    return {
      loading: true
    };
  },
  render() {
    if (this.state.error) return <Alert bsStyle="danger">Tietojen hakeminen epäonnistui</Alert>;
    if (this.state.loading) return <Well>Ladataan tietoja..</Well>;
    return (
      <Table responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Ratsastaja</th>
            <th>Hevonen</th>
            <th>Seura</th>
            <th>Yhteensä</th>
          </tr>
        </thead>
        <tbody>
          { this.state.data.standings.map((one, i) => {
            return (
              <tr key={i}>
                <td>{i+1}</td>
                <td>{one.rider_name}</td>
                <td>{one.horse_name}</td>
                <td>{one.club_name}</td>
                <td>{one.total_points}</td>
              </tr>
              );
          }) }
        </tbody>
      </Table>
    );
  }
});

var Tietoja = React.createClass({
  render() {
    return (
      <div>
        <p>Tämän palvelun on toteuttanut Niklas Närhinen (<a href="mailto:niklas@narhinen.net">Niklas Närhinen</a>)</p>
        <p>Tiedot haetaan suoraan <a href="http://online.equipe.com">Equipe Online palvelusta</a></p>
        <p>Palvelu on epävirallinen eikä Suomen Ratsastajainliitolla ole mitään tekemistä sen kanssa. Viralliset tulokset löytyvät <a href="http://www.ratsastus.fi/kilpailut/tulokset/sarjakilpailutulokset_2011">ratsastajainliiton sivuilta</a>.</p>
      </div>
    );
  }
});


var routes = (
  <Route handler={App}>
    <Route handler={Amatoorisarja} path="/amatoorisarja" />
    <Route handler={Tietoja} path="/tietoja" />
  </Route>
);

ReactRouter.run(routes, ReactRouter.HashLocation, (Root) => React.render(<Root />, document.body));

