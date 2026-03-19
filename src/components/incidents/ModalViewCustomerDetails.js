import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  AccordionSet,
  Accordion,
  Button,
  Col,
  Headline,
  Modal,
  ModalFooter,
  Pane,
  Paneset,
  Row,
} from '@folio/stripes/components';
import { useIncidents } from '../../contexts/IncidentContext';
import css from './ModalStyle.css';

const ModalViewCustomerDetails = ({ customerID, customersForView }) => {
  const { isModalViewCustomerDetails, closeModalViewCustomerDetails } =
    useIncidents();

  // uses 'description' field in customer object
  const [customerDescription, setCustomerDescription] = useState('');
  // uses 'details' object in customer object
  const [customerDetailsData, setCustomerDetailsData] = useState({
    sex: '',
    race: '',
    height: '',
    weight: '',
    hair: '',
    eyes: '',
    dateOfBirth: '',
    streetAddress: '',
    city: '',
    state: '',
    zipcode: '',
  });

  useEffect(() => {
    const currentCustomer = customersForView.find(
      (cust) => cust.id === customerID
    );
    if (currentCustomer && currentCustomer.details) {
      const currentDetails = {
        sex: currentCustomer.details.sex || '',
        race: currentCustomer.details.race || '',
        height: currentCustomer.details.height || '',
        weight: currentCustomer.details.weight || '',
        hair: currentCustomer.details.hair || '',
        eyes: currentCustomer.details.eyes || '',
        dateOfBirth: currentCustomer.details.dateOfBirth || '',
        streetAddress: currentCustomer.details.streetAddress || '',
        city: currentCustomer.details.city || '',
        state: currentCustomer.details.state || '',
        zipcode: currentCustomer.details.zipcode || ''
      };
      setCustomerDetailsData(currentDetails);
    }
    if (currentCustomer && currentCustomer.description) {
      const currentDescription = currentCustomer.description || '';
      setCustomerDescription(currentDescription);
    }
  }, [customerID, customersForView]);

  const createMarkup = (content) => {
    return {__html: content}
  };

  if (!isModalViewCustomerDetails) {
    return null;
  }

  const footer = (
    <ModalFooter>
      <Button
        onClick={closeModalViewCustomerDetails}
        buttonStyle="primary"
        marginBottom0
      >
        <FormattedMessage id="close-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{ minHeight: '600px' }}
      open
      dismissible
      onClose={closeModalViewCustomerDetails}
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-view-customer-details-label" />}
      size="large"
      footer={footer}
      contentClass={css.modalContent}
    >
      <Paneset>
        <Pane defaultWidth="100%">
          <AccordionSet>
            <Accordion
              label={
                <FormattedMessage id="modal-view-customer-details.accordion-label-customer-description" />
              }
            >
              <Row>
                <Col xs={4}>
                  <div 
                    dangerouslySetInnerHTML={createMarkup(customerDescription)}>
                  </div>
                </Col>
              </Row>
            </Accordion>
            <Accordion
              label={
                <FormattedMessage id="modal-view-customer-details.accordion-label-identity-details" />
              }
            >
              <Row style={{ marginTop: '30px' }}>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-sex" />
                  </Headline>
                  <p>
                    {customerDetailsData.sex ? customerDetailsData.sex : '-'}
                  </p>
                </Col>

                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-race" />
                  </Headline>
                  <p>
                    {customerDetailsData.race ? customerDetailsData.race : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-weight" />
                  </Headline>
                  <p>
                    {customerDetailsData.height
                      ? customerDetailsData.height
                      : '-'}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: '30px' }}>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-weight" />
                  </Headline>
                  <p>
                    {customerDetailsData.weight
                      ? customerDetailsData.weight
                      : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-hair" />
                  </Headline>
                  <p>
                    {customerDetailsData.hair ? customerDetailsData.hair : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-eyes" />
                  </Headline>
                  <p>
                    {customerDetailsData.eyes ? customerDetailsData.eyes : '-'}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: '30px' }}>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-date-of-birth" />
                  </Headline>
                  <p>
                    {customerDetailsData.dateOfBirth
                      ? customerDetailsData.dateOfBirth.slice(0, 10)
                      : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-street-address" />
                  </Headline>
                  <p>
                    {customerDetailsData.streetAddress
                      ? customerDetailsData.streetAddress
                      : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-city" />
                  </Headline>
                  <p>
                    {customerDetailsData.city ? customerDetailsData.city : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-state" />
                  </Headline>
                  <p>
                    {customerDetailsData.state
                      ? customerDetailsData.state
                      : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h2">
                    <FormattedMessage id="modal-view-customer-details.headline-zipcode" />
                  </Headline>
                  <p>
                    {customerDetailsData.zipcode
                      ? customerDetailsData.zipcode
                      : '-'}
                  </p>
                </Col>
              </Row>
            </Accordion>
          </AccordionSet>
        </Pane>
      </Paneset>
    </Modal>
  );
};

ModalViewCustomerDetails.propTypes = {
  customerID: PropTypes.string.isRequired,
  customersForView: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ModalViewCustomerDetails;