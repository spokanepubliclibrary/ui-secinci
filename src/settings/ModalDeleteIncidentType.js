import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalFooter } from '@folio/stripes/components';

const ModalDeleteIncidentType = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  const footer = (
    <ModalFooter>
      <Button onClick={onConfirm} buttonStyle="warning">
        <FormattedMessage id="delete-button"/>
      </Button>
      <Button onClick={onClose}>
        <FormattedMessage id="cancel-button"/>
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={isOpen}
      dismissible
      closeOnBackgroundClick
      label={
        <FormattedMessage id="settings.incident-types-modal-delete-label" />
      }
      size="small"
      onClose={onClose}
      footer={footer}
    >
      <section>
        <p>
          <FormattedMessage id="settings.incident-types-delete-warn" />
        </p>
      </section>
    </Modal>
  );
};

ModalDeleteIncidentType.propTypes = {
  isOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ModalDeleteIncidentType;
