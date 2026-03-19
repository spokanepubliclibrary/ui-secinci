import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';
class CreateReport extends React.Component {
  static contextType = IncidentContext;

  static manifest = Object.freeze({
    incident: {
      type: 'okapi',
      records: 'incidents',
      POST: {
        path: 'incidents',
        // path: 'invalid_test_endpoint',
      },
      accumulate: true,
    },
  });

  // console.log("manifest _resourceData:", JSON.stringify(_resourceData, null, 2));

  static propTypes = {
    data: PropTypes.object,
    mutator: PropTypes.shape({
      incident: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.createReport(this.props.data);
    }
  }

  createReport = (data) => {
    // handle create report w/ attachments
    if (data.attachments && data.attachments.length > 0) {
      const attachmentsArray = data.attachments.map(att => ({ ...att }) );
      const { attachments, ...preppedData } = data; 
      
      this.props.mutator.incident
        .POST(preppedData)
        .then((response) => {
          const id = response.data.id;
          this.context.setIdForMediaCreate(id);
          this.context.setFormDataArrayForMediaCreate(attachmentsArray);
          // setIsCreatingReport(false) invoked at CreateMedia
          this.context.setMode('createMode');
          // const defaultQuery = ''; // server response defaults to show most recent top 1000
          // this.context.setQueryString(defaultQuery);
          return response;
        })
        .catch((error) => {
          console.error(
            '@createReport - WITH Attachments - Error occurred:',
            error
          );
        });

      // handle create report w/out attachments
    } else if (data.attachments && data.attachments.length === 0) {
      this.props.mutator.incident
        .POST(data)
        .then((response) => {
          const id = response.data.id;
          this.context.setIdForMediaCreate(null);
          this.context.setFormDataArrayForMediaCreate(null);
          this.context.setIncidentsList([]);
          this.context.setMode('createMode');
          // const defaultQuery = ''; // server response defaults to show most recent n
          // this.context.setQueryString(defaultQuery);
          this.context.setIsCreatingReport(false);
          this.props.handleCloseNewOnSuccess(id);
          return response;
        })
        .catch((error) => {
          console.error(
            '@createReport - NO Attachments - Error occurred:',
            error
          );
          console.log('The error object: ', JSON.stringify(error, null, 2));
          this.context.setModalErrorContent(
            error.message || '@CreateReport - Unknown error'
          );
          this.context.openModalError();
        });
    }
  };

  render() {
    return <></>;
  }
}

CreateReport.contextType = IncidentContext;
CreateReport.propTypes = {
  handleCloseNewOnSuccess: PropTypes.func.isRequired,
};

export default stripesConnect(CreateReport, '@spokane-folio/security-incident');
