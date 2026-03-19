
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Checkbox,
  Col,
  Modal,
  ModalFooter,
  Pane,
  PaneHeader,
  Paneset,
  Row,
  TextField,
  TextArea
} from '@folio/stripes/components';

const ModalPreviewTrespassDoc = ({ 
  closePreviewModal,
  previewContent
}) => {
  
  const footer = (
    <ModalFooter>
      <Button
        onClick={closePreviewModal}
        buttonStyle="primary"
        marginBottom0
      >
        <FormattedMessage id="close-button"/>
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{
        minHeight: '250px',
        height: '80%', // allows modal to grow/shrink based on content
        maxHeight: '300vh', 
        maxWidth: '300vw', // modal width responsive to viewport width
        width: '70%' // modal width adjusts based on content and window size
      }}
      open
      dismissible
      closeOnBackgroundClick
      label='Preview trespass template document'
      size='large'
      onClose={closePreviewModal}
      footer={footer}
    >
    <div
      style={{ 
        padding: '1em',
        maxHeight: 'calc(80vh - 100px)', // Adjust based on modal header/footer height
        overflowY: 'auto',
        whiteSpace: 'pre-wrap'
      }}
      dangerouslySetInnerHTML={{ __html: previewContent }}>
    </div>
    </Modal>
  );
};

export default ModalPreviewTrespassDoc; 