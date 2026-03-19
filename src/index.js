import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { IntlProvider } from 'react-intl';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import enUStranslations from '../translations/ui-security-incident/en_US';
import Settings from './settings';
import Application from './routes/Application';
import CreatePane from './components/incidents/CreatePane';
import DetailsPane from './components/incidents/DetailsPane';
import EditPane from './components/incidents/EditPane';
import { IncidentProvider } from './contexts/IncidentContext';
class SecurityIncident extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    showSettings: PropTypes.bool,
    stripes: PropTypes.shape({
      connect: PropTypes.func,
    }),
  };
  
  render() {
    const {
      showSettings,
      match: { path },
      stripes,
    } = this.props;

    if (showSettings) {
      return (
        <IntlProvider 
          locale="en" 
          messages={enUStranslations} 
          >
          <IncidentProvider>
            <Settings {...this.props} />
          </IncidentProvider>
        </IntlProvider>
      );
    }

    return (
      <IntlProvider 
        locale="en" 
        messages={enUStranslations} 
        >
        <IncidentProvider>
          <Switch>
            <Route path={path} exact component={Application} />
            <Route path={`${path}/create`} exact component={CreatePane} />
            <Route path={`${path}/:id`} exact component={DetailsPane} />
            <Route path={`${path}/:id/edit`} exact component={EditPane} />
          </Switch>
        </IncidentProvider>
      </IntlProvider>
    );
  }
}

export default SecurityIncident;