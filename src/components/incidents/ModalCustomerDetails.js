import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DOMPurify from 'dompurify';
import {
  AccordionSet,
  Accordion,
  Button,
  Col,
  Datepicker,
  Editor,
  Modal,
  ModalFooter,
  Pane,
  Paneset,
  Row,
  TextField,
} from '@folio/stripes/components';
import { useIncidents } from '../../contexts/IncidentContext';
import isValidDateFormat from './helpers/isValidDateFormat';
import stripHTML from './helpers/stripHTML';
import css from './ModalStyle.css';

const ModalCustomerDetails = ({
  customerID, 
  allCustomers, //merged array from EditPane context [...selectedCustomers, formData.customers(instance custs)]
  setAllCustomers // setter for allCustomers
}) => {
  const {
    isModalCustomerDetails,
    closeModalCustomerDetails,
    selectedCustomers, // customers array from CreatePane context 
    setSelectedCustomers, // setter for selectedCustomers
  } = useIncidents();

  const [customersArray, setCustomersArray] = useState([]);
  const [workWithEdit, setWorkWithEdit] = useState(false);
  const [isCustomerRegistered, setIsCustomerRegistered] = useState(true);
  const [unregisteredNames, setUnregisteredNames] = useState({
    firstName: '',
    lastName: ''
  });
  const [useNames, setUseNames] = useState(false);
  const [localCustomerDescription, setLocalCustomerDescription] = useState('');
  const [localCustomerDetailsData, setLocalCustomerDetailsData] = useState({
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
  
  // set local customersArray based on context use
  useEffect(() => {
    if (allCustomers) {
      // setting if rendered via @EditPane
      setWorkWithEdit(true);
      setCustomersArray(allCustomers);
    } else if (selectedCustomers) {
      // setting of rendered via @CreatePane
      setCustomersArray(selectedCustomers);
    }
  }, [selectedCustomers, allCustomers]);

  // populate modal state with current customer data
  useEffect(() => {
    const currentCustomer = customersArray.find(
      (cust) => cust.id === customerID
    );

    if (currentCustomer && currentCustomer.details) {
      setLocalCustomerDetailsData({
        sex: currentCustomer.details?.sex || '',
        race: currentCustomer.details?.race || '',
        height: currentCustomer.details?.height || '',
        weight: currentCustomer.details?.weight || '',
        hair: currentCustomer.details?.hair || '',
        eyes: currentCustomer.details?.eyes || '',
        dateOfBirth: currentCustomer.details?.dateOfBirth || '',
        streetAddress: currentCustomer.details?.streetAddress || '',
        city: currentCustomer.details?.city || '',
        state: currentCustomer.details?.state || '',
        zipcode: currentCustomer.details?.zipcode || '',
      });
    } else {
      setLocalCustomerDetailsData({
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
    };

    if (currentCustomer && currentCustomer.description) {
      setLocalCustomerDescription(currentCustomer.description || '');
    } else {
      setLocalCustomerDescription('');
    };

    if (currentCustomer && currentCustomer.registered === false) {
      setIsCustomerRegistered(false) // setter for no require customer 'description'
      // console.log("is NOT registered block ran")
      setUseNames(true) //if not registered, use instance name values and not associated key name
      setUnregisteredNames({
        firstName: currentCustomer.firstName,
        lastName: currentCustomer.lastName
      });
    } else {      
      // console.log("IS registered block ran")
      setIsCustomerRegistered(true)
      setUseNames(false); // hide the name fields if registered
      setUnregisteredNames({
        firstName: '',
        lastName: '',
      });
    };
  }, [isModalCustomerDetails, customerID, customersArray]);


  const handleDetailsChange = (event) => {
    const { name, value } = event.target;
    setLocalCustomerDetailsData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (content) => {
    const sanitizedContent = DOMPurify.sanitize(content);
    setLocalCustomerDescription(sanitizedContent);
  };

  const isFormValid = () => {
    const isDateOfBirthValid = localCustomerDetailsData.dateOfBirth === '' ||
      isValidDateFormat(localCustomerDetailsData.dateOfBirth);

    const isEditorValid = isCustomerRegistered || (localCustomerDescription && stripHTML(localCustomerDescription)); 
  
    return isDateOfBirthValid && isEditorValid;
  };

  const handleUnregisteredNames = (event) => {
    const { name, value } = event.target;
    setUnregisteredNames((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  };

  const normalizeDescription = (html) => {
    const raw = (html || '').trim();
    return stripHTML(raw) ? raw : undefined;
  };

  const handleSave = () => {
    const updatedCustomerArray = customersArray.map((cust) => {
      if (cust.id === customerID) {
        const cleanedDetails = Object.entries(localCustomerDetailsData).reduce((acc, [k, v]) => {
          const trimmed = typeof v === 'string' ? v.trim() : v;
          if (trimmed !== '' && trimmed !== null && trimmed !== undefined) {
            acc[k] = trimmed;
          }
          return acc;
        }, {});

        // only include details if it has non-empty fields
        const hasDetails = Object.keys(cleanedDetails).length > 0;

        const updatedCustomer = {
          ...cust,
          firstName: useNames ? unregisteredNames.firstName : cust.firstName,
          lastName: useNames ? unregisteredNames.lastName : cust.lastName,  
          ...(hasDetails ? { details: cleanedDetails } : {})
        };

        const normalizeDesc = normalizeDescription(localCustomerDescription);
        if (normalizeDesc) {
          updatedCustomer.description = normalizeDesc;
        } else {
          delete updatedCustomer.description
        };

        if (!hasDetails && 'details' in updatedCustomer) {
          delete updatedCustomer.details;
        };

        return updatedCustomer;
      };
      return cust;
    });

    if (workWithEdit) {
      // setting via EditPane
      setAllCustomers(updatedCustomerArray);
    } else {
      // setting via CreatePane, using setSelectedCustomers
      setSelectedCustomers(updatedCustomerArray);
    };

    resetModalState();
    closeModalCustomerDetails();
  };

  const resetModalState = () => {
    setLocalCustomerDescription('');
    setLocalCustomerDetailsData({
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
    
    setUnregisteredNames({ firstName: '', lastName: '' });
    setWorkWithEdit(false);
    setUseNames(false);
    setIsCustomerRegistered(true);
  };

  const handleCloseDismiss = () => {
    setIsCustomerRegistered(true);
    resetModalState();
    closeModalCustomerDetails();
  };

  if (!isModalCustomerDetails) {
    return null;
  };

  const editorModules = {
   toolbar: [
      [{ 'header': [1, 2, false] }], 
      ['bold', 'italic', 'underline'], 
    ],
  };

  const footer = (
    <ModalFooter>
      <Button
        onClick={handleSave}
        buttonStyle="primary"
        marginBottom0
        disabled={!isFormValid()} 
      >
        <FormattedMessage id="close-continue-button" />
      </Button>
      <Button onClick={handleCloseDismiss}>
        <FormattedMessage id="cancel-button" />
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
      onClose={handleCloseDismiss}
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-customer-details-label" />}
      size="large"
      footer={footer}
      contentClass={css.modalContent}
    >
      <Paneset>
        <Pane defaultWidth="100%">
          <AccordionSet>
            <Accordion
              label={
                <FormattedMessage id="modal-customer-details.accordion-label-customer-description" />
              }
            >
              {useNames && (
                <>
                <Row>
                  <Col xs={3}>
                    <TextField 
                      onChange={handleUnregisteredNames}
                      value={unregisteredNames.firstName}
                      name="firstName"
                      label={
                        <FormattedMessage id="modal-customer-details.textField-first-name-label" />
                      }
                    />
                  
                  </Col>
                </Row>
                <Row>
                  <Col xs={3}>
                  <TextField 
                   onChange={handleUnregisteredNames}
                    value={unregisteredNames.lastName}
                    name="lastName"
                    label={
                      <FormattedMessage id="modal-customer-details.textField-last-name-label" />
                    }
                  />
                  </Col>
                </Row>
                </>
              )}

              <Row>
                <Col xs={6}>
                  <Editor
                    required={!isCustomerRegistered}
                    label={
                      <FormattedMessage id="modal-customer-details.textArea-description-of-customer-label" />
                    }
                    value={localCustomerDescription} 
                    onChange={handleDescriptionChange}
                    modules={editorModules}
                  />
                </Col>
              </Row>
            </Accordion>
            <Accordion
              label={
                <FormattedMessage id="modal-customer-details.accordion-identity-details"/>
              }
            >
              <Row>
                <Col xs={2}>
                  <TextField
                    label={<FormattedMessage id="modal-customer-details-sex" />}
                    name="sex"
                    value={localCustomerDetailsData.sex}
                    onChange={handleDetailsChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-race" />
                    }
                    name="race"
                    value={localCustomerDetailsData.race}
                    onChange={handleDetailsChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-height" />
                    }
                    name="height"
                    value={localCustomerDetailsData.height}
                    onChange={handleDetailsChange}
                  />
                </Col>
              </Row>

              <Row>
                 <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-weight" />
                    }
                    name="weight"
                    value={localCustomerDetailsData.weight}
                    onChange={handleDetailsChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-hair" />
                    }
                    name="hair"
                    value={localCustomerDetailsData.hair}
                    onChange={handleDetailsChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-eyes" />
                    }
                    name="eyes"
                    value={localCustomerDetailsData.eyes}
                    onChange={handleDetailsChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={3}>
                  <Datepicker
                    label={
                      <FormattedMessage id="modal-customer-details-date-of-birth" />
                    }
                    name="dateOfBirth"
                    value={localCustomerDetailsData.dateOfBirth}
                    onChange={handleDetailsChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={4}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-street-address" />
                    }
                    name="streetAddress"
                    value={localCustomerDetailsData.streetAddress}
                    onChange={handleDetailsChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-city" />
                    }
                    name="city"
                    value={localCustomerDetailsData.city}
                    onChange={handleDetailsChange}
                  />
                </Col>
              </Row>
              <Row style={{ marginBottom: '100px' }}>
                 <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-state" />
                    }
                    name="state"
                    value={localCustomerDetailsData.state}
                    onChange={handleDetailsChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-zipcode" />
                    }
                    name="zipcode"
                    value={localCustomerDetailsData.zipcode}
                    onChange={handleDetailsChange}
                  />
                </Col>
              </Row>
            </Accordion>
          </AccordionSet>
        </Pane>
      </Paneset>
    </Modal>
  );
};

ModalCustomerDetails.propTypes = {
  customerID: PropTypes.string.isRequired,
  customersList: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCustomersList: PropTypes.func.isRequired,
};

export default ModalCustomerDetails;
