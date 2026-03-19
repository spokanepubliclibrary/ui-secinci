
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Checkbox,
  Col,
  Modal,
  ModalFooter,
  Row,
} from '@folio/stripes/components';

const ModalTrespassDocTokens = ({ 
  setShowTokensModal, 
  selectedTokens, setSelectedTokens,
  handleInsertTokens, tokensArray
}) => {

  const handleCloseDismiss = () => {
    setShowTokensModal(false);
    setSelectedTokens([])
  };

  const handleCheckboxChange = (tokenValue, isChecked) => {
    if (isChecked) {
      setSelectedTokens((prev) => [...prev, tokenValue])
    } else {
      setSelectedTokens((prev) => prev.filter((val) => val !== tokenValue))
    }
  };

  const handleInsertClick = () => {
    handleInsertTokens(selectedTokens)
  };

  const footer = (
    <ModalFooter>
      <Button
        onClick={handleInsertClick}
        buttonStyle="primary"
        marginBottom0
      >
        <FormattedMessage id="settings.trespass-document-template.insert-selected-tokens"/>
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
      label='Tokens'
      size='large'
      onClose={handleCloseDismiss}
      footer={footer}
    >
      <Row>
        <Col>
        {tokensArray.map((token) => (
          <Checkbox
            key={token.value}
            label={token.label}
            checked={selectedTokens.includes(token.value)}
            value={token.value}
            onChange={(e) => handleCheckboxChange(token.value, e.target.checked)}
          />
        ))}
        </Col>
      </Row>

    </Modal>
  );
};

export default ModalTrespassDocTokens; 