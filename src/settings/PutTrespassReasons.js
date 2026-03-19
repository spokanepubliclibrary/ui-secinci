import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';

class PutTrespassReasons extends React.Component {
  static manifest = Object.freeze({
    trespassReasons: {
      type: 'okapi',
      path: `incidents/configurations/trespass-reasons`, 
      PUT: {
        path: `incidents/configurations/trespass-reasons`, 
      },
      fetch: false,
      accumulate: false
    },
  }); 

  static propTypes = {
    data: PropTypes.object,
    mutator: PropTypes.shape({
      trespassReasons: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    handleFinishEdit: PropTypes.func, // not required (invoked in Edit)
    onSuccess: PropTypes.func, // not required (invoked in Paneset 'new')
    handleDeleteSuccess: PropTypes.func // not required (invoked in delete context)
  };

  componentDidMount() {
    if (this.props.data) {
      this.updateTrespassReasons(this.props.data);
    }
  };

  updateTrespassReasons = async (data) => {
   if (this.props.context === 'delete') {
    try {
      await this.props.mutator.trespassReasons.PUT(data);
      this.props.onSuccess?.() // tell parent paneset it succeeded
      this.props.handleDeleteSuccess() 
    } catch (error) {
      console.error('error updating: ', error);
    }
   } else {
    try {
      await this.props.mutator.trespassReasons.PUT(data);
      this.props.onSuccess?.() // tell parent paneset it succeeded
      this.props.handleFinishEdit() // close out Edit work
    } catch (error) {
      console.error('error updating: ', error);
    }
   }
  };

  render() {
    return null;
  };
};

export default stripesConnect(PutTrespassReasons, '@spokane-folio/security-incident');