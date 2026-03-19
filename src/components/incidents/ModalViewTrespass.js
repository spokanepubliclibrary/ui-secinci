import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  AccordionSet,
  Accordion,
  Button,
  Col,
  Headline,
  List,
  Modal,
  ModalFooter,
  Pane,
  Paneset,
  Row,
} from '@folio/stripes/components';
import { useIncidents } from '../../contexts/IncidentContext';
import css from './ModalStyle.css';
import GetLocationsInService from '../../settings/GetLocationsInService';

const ModalViewTrespass = ({ customerID, customersForView }) => {
  const { 
    isModalViewTrespass, 
    closeModalViewTrespass, 
    locationsInService 
  } = useIncidents();

  const [trespassData, setTrespassData] = useState({
    dateOfOccurrence: '',
    exclusionOrTrespassBasedOn: [],
    witnessedBy: { witnesses: [] },
    endDateOfTrespass: '',
    declarationOfService: {
      date: '',
      placeSigned: '',
      title: '',
      signature: false,
    },
  });

  const associatedKeyPlaceSigned = (value) => {
    // value is expected to tbe the id associated w/ locationInService obj
    const locObject = locationsInService.find(loc => loc.id === value)
    // return the obj's location (which is the 'Pretty Name')
    return locObject ? locObject.location : '';
  };

  useEffect(() => {
    const currentCustomer = customersForView.find(
      (cust) => cust.id === customerID
    );
    if (currentCustomer && currentCustomer.trespass) {
      const trespass = currentCustomer.trespass;
      const declarationOfService = trespass.declarationOfService || {
        date: '',
        placeSigned: '',
        title: '',
        signature: false,
      };

      const currentDetails = {
        dateOfOccurrence: trespass.dateOfOccurrence || '',
        exclusionOrTrespassBasedOn: trespass.exclusionOrTrespassBasedOn || [],
        endDateOfTrespass: trespass.endDateOfTrespass || '',
        declarationOfService: declarationOfService ? {
          date: declarationOfService.date || '',
          placeSigned: associatedKeyPlaceSigned(declarationOfService.placeSigned) || '',
          title: declarationOfService.title || '',
          signature: declarationOfService.signature || false,
        } : {
          date: '',
          placeSigned: '',
          title: '',
          signature: false,
        },
      };
      setTrespassData(currentDetails);
    }
  }, [customerID, customersForView]);

  const itemsFormatterExclusionList = (item) => {
    return <li style={{ marginLeft: '10px' }}>{item}</li>;
  };

  if (!isModalViewTrespass) {
    return null;
  };

  const footer = (
    <ModalFooter>
      <Button
        onClick={closeModalViewTrespass}
        buttonStyle="primary"
        marginBottom0
      >
        <FormattedMessage id="close-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{ minHeight: '1050px' }}
      open
      dismissible
      onClose={closeModalViewTrespass}
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-view-trespass-label" />}
      size="large"
      footer={footer}
      contentClass={css.modalContent}
    >
      <Paneset>
        <Pane defaultWidth="100%">
          <GetLocationsInService />
          <AccordionSet>
            <Accordion
              label={
                <FormattedMessage id="modal-view-trespass.accordion-trespass-details-label" />
              }
            >
              <Row style={{ marginTop: '15px' }}>
                <Col xs={4}>
                  <Headline size="medium" tag="h3">
                    <FormattedMessage id="modal-view-trespass.headline-exclusion-based-on" />
                  </Headline>
                  <List
                    label={
                      <FormattedMessage id="modal-view-trespass.headline-exclusion-based-on" />
                    }
                    listStyle="bullets"
                    items={trespassData.exclusionOrTrespassBasedOn}
                    itemFormatter={itemsFormatterExclusionList}
                    isEmptyMessage="-"
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: '15px' }}>
                <Col xs={4}>
                  <Headline size="medium" tag="h3">
                    <FormattedMessage id="modal-view-trespass.headline-end-date-trespass" />
                  </Headline>
                  <p>
                    {trespassData.endDateOfTrespass
                      ? trespassData.endDateOfTrespass.slice(0, 10)
                      : '-'}
                  </p>
                </Col>
              </Row>
            </Accordion>

            <Accordion
              label={
                <FormattedMessage id="modal-view-trespass.accordion-declaration-of-service-label" />
              }
            >
              <Row style={{ marginTop: '15px' }}>
                <Col xs={2}>
                  <Headline size="medium" tag="h3">
                    <FormattedMessage id="modal-view-trespass.headline-date-served" />
                  </Headline>
                  <p>
                    {trespassData.declarationOfService.date
                      ? trespassData.declarationOfService.date.slice(0, 10)
                      : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h3">
                    <FormattedMessage id="modal-view-trespass.headline-place-signed" />
                  </Headline>
                  <p>
                    {trespassData.declarationOfService.placeSigned
                      ? trespassData.declarationOfService.placeSigned
                      : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h3">
                    <FormattedMessage id="modal-view-trespass.headline-title" />
                  </Headline>
                  <p>
                    {trespassData.declarationOfService.title
                      ? trespassData.declarationOfService.title
                      : '-'}
                  </p>
                </Col>
                <Col xs={2}>
                  <Headline size="medium" tag="h3">
                    <FormattedMessage id="modal-view-trespass.headline-signed" />
                  </Headline>
                  <p>
                    {trespassData.declarationOfService.signature ? 'Yes' : '-'}
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

ModalViewTrespass.propTypes = {
  customerID: PropTypes.string.isRequired,
  customersForView: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ModalViewTrespass;