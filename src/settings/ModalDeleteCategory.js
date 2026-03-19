import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalFooter } from '@folio/stripes/components';

const ModalDeleteCategory = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  const footer = (
    <ModalFooter>
      <Button onClick={onConfirm} buttonStyle="primary">
        <FormattedMessage id="settings.categories-delete-button" />
      </Button>
      <Button onClick={onClose}>
        <FormattedMessage id="settings.categories-cancel-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={isOpen}
      dismissible
      closeOnBackgroundClick
      label={<FormattedMessage id="settings.categories.modal-delete-label" />}
      size="small"
      onClose={onClose}
      footer={footer}
    >
      <section>
        <p>
          <FormattedMessage id="settings.categories-delete-warn" />
        </p>
      </section>
    </Modal>
  );
};

ModalDeleteCategory.propTypes = {
  isOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ModalDeleteCategory;