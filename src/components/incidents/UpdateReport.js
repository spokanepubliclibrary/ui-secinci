import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { IncidentContext } from '../../contexts/IncidentContext';

class UpdateReport extends React.Component {
  static contextType = IncidentContext;

  static manifest = Object.freeze({
    incident: {
      type: 'okapi',
      records: 'incidents',
      PUT: {
        path: 'incidents/!{id}',
      },
      accumulate: true,
    },
  });

  // console.log("manifest _resourceData:", JSON.stringify(_resourceData, null, 2));

  static propTypes = {
    id: PropTypes.string,
    data: PropTypes.object,
    mutator: PropTypes.shape({
      incident: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    handleCloseEdit: PropTypes.func.isRequired,
  };

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data && this.props.id) {
      this.updateReport(this.props.id, this.props.data);
    }
  }

  updateReport = (id, data) => {
    // handle update report w/ attachments
    if (this.context.attachmentsData && this.context.attachmentsData.length > 0) { 
      console.log("EDIT HAS ATTACHMENTS RAN")
      this.props.mutator.incident
      .PUT(data)
      .then(() => {
        this.context.setIdForMediaCreate(this.props.id);
        this.context.setFormDataArrayForMediaCreate(this.context.attachmentsData);
      })
      .catch((error) => {
        // this.context.setUseGetList(false);
        console.error(
          '@updateReport - WITH Attachments - Error occurred: ',
          error
        );
      });
    } else {
      // handle update report w/out attachments
      this.props.mutator.incident
        .PUT(data)
        .then(() => {
          this.context.setIsLoadingDetails(false);
          this.context.setIsUpdatingReport(false)
          this.props.handleCloseEdit();
          // this.context.setUseGetList(false);
          // console.log('update successful');
        })
        .catch((error) => {
          // this.context.setUseGetList(false);
          console.error(
            '@updateReport - NO Attachments - Error occurred: ',
            error
          );
        });
    }
  };

  render() {
    return <></>;
  }
}

UpdateReport.contextType = IncidentContext;

export default stripesConnect(UpdateReport, '@spokane-folio/security-incident');