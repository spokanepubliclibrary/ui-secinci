import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  Modal,
  ModalFooter,
  Row,
} from '@folio/stripes/components';
import css from './ModalStyle.css';

const ModalDirtyFormWarn = ({ handleKeepEditing, handleDismissOnDirty }) => {
  const footer = (
    <ModalFooter>
      <Button 
        onClick={handleKeepEditing}
        buttonStyle="primary"
        >
        <FormattedMessage id="keep-editing-button" />
      </Button>
      <Button
        onClick={handleDismissOnDirty}
      >
        <FormattedMessage id="close-without-saving-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{ 
        minHeight: '150px',
        height: '20%',
        maxHeight: '100vh',
        maxWidth: '300vw',
        width: '60%' 
      }}
      open
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-dirty-form-warn-label" />}
      size="large"
      footer={footer}
      contentClass={css.modalContent}
    >
      <Row style={{ marginTop: '25px' }}>
        <Col 
          xs={12}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
          >
          <FormattedMessage id="modal-dirty-form-warn-message" />
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalDirtyFormWarn;