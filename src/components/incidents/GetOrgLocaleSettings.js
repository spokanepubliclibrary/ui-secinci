import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';



class GetOrgLocaleSettings extends React.Component {
  static contextType = IncidentContext;
  static manifest = Object.freeze({
    localeSettings: {
      type: 'okapi',
      path: 'configurations/entries?query=module==ORG and configName==localeSettings and enabled=true'
    },
  });

  static propTypes = {
    localeSettings: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
    resources: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.fetchOrgTimezone();
  }

  componentDidUpdate(prevProps) {
    this.fetchOrgTimezone(prevProps);
  }

  fetchOrgTimezone(prevProps = {}) {
    const currentResources = this.props.resources || {};
    const prevResources = prevProps.resources || {};
    const currentLocaleSettings = currentResources.localeSettings;
    const prevLocaleSettings = prevResources.localeSettings;
    if (currentLocaleSettings && currentLocaleSettings !== prevLocaleSettings) {
      try {
        const localeSettingsRecords = currentLocaleSettings.records;
        if (localeSettingsRecords && localeSettingsRecords.length > 0) {
          const orgTimezone = JSON.parse(localeSettingsRecords[0].configs[0].value).timezone;
          this.context.setOrganizationTimezone(orgTimezone);
        }
      } catch (error) {
        // placeholder
        console.log('@fetchOrgTimezone - error parsing: ', error.message);
      }
    } else {
      // no new loaded data yet. prev logged here, but removed to reduce noise in console
      return;
    };
  };

  render() {
    return <></>;
  };
};

GetOrgLocaleSettings.contextType = IncidentContext;

export default stripesConnect(GetOrgLocaleSettings, '@spokane-folio/security-incident');
