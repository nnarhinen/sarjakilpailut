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
        <Navbar brand={<Link to="front">Sarjakilpailutilanteet</Link>} inverse toggleNavKey={0} staticTop>
          <Nav right eventKey={0}>
            <DropdownButton eventKey={1} title='Kilpailut'>
              {Object.keys(routesNames).map((name) => <MenuItem onSelect={this.onMenuSelect} eventKey={'/' + name} key={name}>{routesNames[name]}</MenuItem>)}
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

var ResultDetails = React.createClass({
  render() {
    var one = this.props.item;
    return (
      <Well style={{cursor: 'pointer'}}>
        <h2>{this.props.rank}. {one.rider_name} <small>{one.horse_name}</small></h2>
        <h3>{one.club_name}</h3>
        <Table>
          <thead>
            <tr>
              <th>Paikka ja aika</th>
              <th>Sijoitus</th>
              <th>Tulos</th>
              <th>Pisteet</th>
            </tr>
          </thead>
          <tbody>
            {one.competitions.map((comp, i) => (
              <tr key={'c' + i}>
                <td>{comp.competition_name}</td>
                <td>{comp.rank}</td>
                <td>{comp.result_preview}</td>
                <td>{comp.points}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Well>
    );
  }
});

var routesNames = {
  'amatoorisarja': 'Amatöörisarja',
  'junioricup': 'Animagi junioricup',
  'gp': 'LähiTapiola Grand Prix'
};

var Series = React.createClass({
  update(props) {
    this.setState({
      loading: true,
      data: null
    });
    axios.get('/data/' + props.params.path).then((resp) => {
      this.setState({
        data: resp.data,
        loading: false
      });
    }).catch(() => this.setState({error: true }));
  },
  componentWillReceiveProps(newProps) {
    this.update(newProps);
  },
  componentDidMount() {
    this.update(this.props);
  },
  getInitialState() {
    return {
      loading: true
    };
  },
  onRowClick(i) {
    return () => {
      this.setState({
        activeItem: this.state.activeItem === i ? null : i
      });
    };
  },
  render() {
    if (this.state.error) return <Alert bsStyle="danger">Tietojen hakeminen epäonnistui</Alert>;
    if (this.state.loading) return <Well>Ladataan tietoja..</Well>;
    return (
      <div>
        <h2>{routesNames[this.props.params.path]}</h2>
        <Table responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Ratsastaja</th>
              <th>Hevonen</th>
              <th>Seura</th>
              <th>Yhteensä (osakilpailua)</th>
            </tr>
          </thead>
          <tbody>
            { this.state.data.standings.map((one, i) => {
              return this.state.activeItem === i ? <tr key={i} onClick={this.onRowClick(i)}><td colSpan={5}><ResultDetails rank={i+1} item={one} /></td></tr> : (
                <tr key={i} onClick={this.onRowClick(i)} style={{cursor: 'pointer'}}>
                  <td>{i+1}</td>
                  <td>{one.rider_name}</td>
                  <td>{one.horse_name}</td>
                  <td>{one.club_name}</td>
                  <td>{one.total_points} ({one.competitions.length})</td>
                </tr>
                );
            }) }
          </tbody>
        </Table>
      </div>
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


var Front = React.createClass({
  render() {
    return (
      <div>
        <h2>SRL:n sarjakilpailujen tilanne</h2>
        <p>Epävirallinen ajantasainen listaus sarjakilpailujen pistetilanteista. <Link to="tietoja">Lue lisää</Link></p>
        <ul>
          {Object.keys(routesNames).map((name) => {
            return <li><Link to="series" params={{path: name}}>{routesNames[name]}</Link></li>;
          })}
        </ul>
      </div>
    );
  }
})

var routes = (
  <Route handler={App}>
    <Route handler={Front} path="/" name="front" />
    <Route handler={Tietoja} path="/tietoja" name="tietoja"/>
    <Route handler={Series} path=":path" name="series" />
  </Route>
);

ReactRouter.run(routes, ReactRouter.HashLocation, (Root) => React.render(<Root />, document.body));

