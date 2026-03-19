import React, { useMemo } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  List,
  Modal,
  ModalFooter,
  Row,
} from '@folio/stripes/components';
import css from './ModalStyle.css';

const ModalAttentionDecOfService = ({ 
  onNo, 
  onYes,
  missingIds,
  allCustomers
}) => {
  const intl = useIntl();

  // compute list to render
  const customersList = useMemo(() => allCustomers.filter((c) => missingIds.includes(c.id)), 
    [allCustomers, missingIds]
  );
  // console.log("customersList --> ", JSON.stringify(customersList, null, 2));

  const itemFormatter = (cust) => {
    const notAvailable = intl.formatMessage({ id: "unknown-name-placeholder" });
    const firstName = cust.registered === false ? 
      cust.firstName || notAvailable : cust.associatedFirstName;
    const lastName = cust.registered === false ?
      cust.lastName || notAvailable : cust.associatedLastName;
    const name = `${lastName}, ${firstName}`;
    return (
      <li>
        {name}
      </li>
    )
  };

  const footer = (
    <ModalFooter>
      <Button 
        onClick={onYes}
        buttonStyle="primary"
        >
        <FormattedMessage id="yes-button" />
      </Button>
      <Button
        onClick={onNo}
      >
        <FormattedMessage id="no-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{ 
        maxHeight: '500vh',
        maxWidth: '300vw',
        width: '60%' 
      }}
      open
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-attention-declaration-of-service" />}
      size="large"
      footer={footer}
      contentClass={css.modalContent}
    >
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        // Ensure inner flex children can shrink and scroll properly
        minHeight: 0,
        maxHeight: 'calc(80vh - 120px)' // headroom for modal header/footer
      }}>
      <Row style={{ marginTop: '25px' }}>
        <Col 
          xs={12}
          style={{ textAlign: 'center' }}
          >
         <FormattedMessage id="modal-attention-declaration-of-service-message" />
        </Col>
      </Row>

      <Row>
        <Col xs={12} >
          <List
            listStyle='bullet'
            items={customersList}
            itemFormatter={itemFormatter}
          />
        </Col>
      </Row>

      <Row style={{ marginBottom: '25px' }}>
        <Col 
          xs={12}
          style={{ textAlign: 'center' }}>
           <FormattedMessage id="modal-attention-declaration-of-service-question" />
        </Col>
      </Row>
    </div>
    </Modal>
  );
};

export default ModalAttentionDecOfService;