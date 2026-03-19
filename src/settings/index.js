import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Settings } from '@folio/stripes/smart-components';
import IncidentCategoriesPane from './IncidentCategoriesPane';
import IncidentTypesPaneset from './IncidentTypesPaneset';
import LocationsPaneset from './LocationsPaneset';
import TrespassDocPaneset from './TrespassDocPaneset';
import TrespassReasonsPaneset from './TrespassReasonsPaneset';

export default class SecurityIncidentSettings extends React.Component {
  pages = [
    {
      route: 'categories',
      label: <FormattedMessage id="settings.categories" />,
      component: (props) => <IncidentCategoriesPane {...props} />,
    },
    {
      route: 'types',
      label: <FormattedMessage id="settings.incident-types" />,
      component: (props) => <IncidentTypesPaneset {...props} />,
    },
    {
      route: 'locations',
      label: <FormattedMessage id="settings.locations" />,
      component: (props) => <LocationsPaneset {...props} />,
    },
    {
      route: 'trespass-template',
      label: <FormattedMessage id="settings.trespass-document-template" />,
      component: (props) => <TrespassDocPaneset {...props} />,
    },
    {
      route: 'trespass-reasons',
      label: <FormattedMessage id="settings.trespass-reasons" />,
      component: (props) => <TrespassReasonsPaneset {...props} />,
    }
  ];

  render() {
    return (
      <Settings
        {...this.props}
        pages={this.pages}
        paneTitle={<FormattedMessage id="settings.label" />}
      />
    );
  }
}
