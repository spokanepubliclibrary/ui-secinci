import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';

class PutTrespassTemplate extends React.Component {
  static manifest = Object.freeze({
    trespassTemplatesPUT: {
      type: 'okapi',
      path: `incidents/configurations/trespass-templates`,
      PUT: {
        path: `incidents/configurations/trespass-templates`,
      }
    },
  });

  static propTypes = {
    data: PropTypes.object,
    mutator: PropTypes.shape({
      trespassTemplatesPUT: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired
  };

  componentDidMount() {
    console.log("COMPONENT DID MOUNT @PutTrespassTemplate - data --> ", JSON.stringify(this.props.data, null, 2))
    if (this.props.data) {
      console.log("IN CONDITION @PutTrespassTemplate - data --> ", JSON.stringify(this.props.data, null, 2))
      this.updateRecords(this.props.data);
    };
  };

  updateRecords = (data) => {
    console.log("@PutTrespassTemplate - data --> ", JSON.stringify(data, null, 2))
    this.props.mutator.trespassTemplatesPUT
      .PUT(data)
      .then(() => {
        console.log("succcess update trespass templates")
      })
      .catch((error) => {
        console.error('error updating: ', error);
      });
  };

  render() {
    return null;
  }
}

export default stripesConnect(PutTrespassTemplate, '@spokane-folio/security-incident');