import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalFooter } from '@folio/stripes/components';

const ModalDeleteLocationInService = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  const footer = (
    <ModalFooter>
      <Button onClick={onConfirm} buttonStyle="warning">
        <FormattedMessage id="delete-button" />
      </Button>
      <Button onClick={onClose}>
        <FormattedMessage id="cancel-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={isOpen}
      dismissible
      closeOnBackgroundClick
      label={
        <FormattedMessage id="settings.custom-location-modal-delete-label" />
      }
      size="small"
      onClose={onClose}
      footer={footer}
    >
      <section>
        <p>
          <FormattedMessage id="settings.button.delete-warn" />
        </p>
      </section>
    </Modal>
  );
};

ModalDeleteLocationInService.propTypes = {
  isOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ModalDeleteLocationInService;
