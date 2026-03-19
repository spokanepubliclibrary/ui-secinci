import React, { useState } from 'react';
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
  Pane,
  Paneset,
  ModalFooter,
  Row,
  TextField,
} from '@folio/stripes/components';
import css from './ModalStyle.css';
import { v4 as uuidv4 } from 'uuid';
import isValidDateFormat from './helpers/isValidDateFormat';
import stripHTML from './helpers/stripHTML';
import { useIncidents } from '../../contexts/IncidentContext';

const ModalDescribeCustomer = () => {
  const {
    isModalUnknownCustOpen,
    closeModalUnknownCust,
    setSelectedCustomers,
  } = useIncidents();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    description: '',
    registered: false,
    id: '',
    details: {
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
    }
  });

  const detailsKeysArray = [
    'sex', 'race', 'height', 'weight', 'hair', 'eyes', 'dateOfBirth', 'streetAddress', 'city', 'state', 'zipcode',
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (detailsKeysArray.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          [name]: value,
        }
      }));
    } else {
      // Otherwise, update the top-level fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDescriptionChange = (content) => {
    const sanitizedContent = DOMPurify.sanitize(content);
    setFormData(prev => ({
      ...prev,
      description: sanitizedContent
    }));
  };

  const isFormDataValid = () => {
    const isDateOfBirthValid = formData.details.dateOfBirth === '' || formData.details.dateOfBirth && isValidDateFormat(formData.details.dateOfBirth);

    const isEditorValid =
      formData.description && stripHTML(formData.description);
    return isEditorValid && isDateOfBirthValid;
  };

  const handleSave = () => {
    setSelectedCustomers((prev) => [
      ...prev,
      {
        id: uuidv4(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        description: formData.description.trim(),
        registered: false,
        details: {
          sex: formData.details.sex.trim(),
          race: formData.details.race.trim(),
          height: formData.details.height.trim(),
          weight: formData.details.weight.trim(),
          hair: formData.details.hair.trim(),
          eyes: formData.details.eyes.trim(),
          dateOfBirth: formData.details.dateOfBirth,
          streetAddress: formData.details.streetAddress.trim(),
          city: formData.details.city.trim(),
          state: formData.details.state.trim(),
          zipcode: formData.details.zipcode.trim(),
        }
      },
    ]);
    // console.log("@ModalDescribeCustomer - handleSave, formData: ", JSON.stringify(formData, null, 2));
    setFormData({
      firstName: '',
      lastName: '',
      description: '',
      registered: false,
      id: '',
      details: {
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
      }
    })
    closeModalUnknownCust();
  };

  if (!isModalUnknownCustOpen) {
    return null;
  };

  const editorModules = {
   toolbar: [
      [{ 'header': [1, 2, false] }], 
      ['bold', 'italic', 'underline'], 
    ],
  };

  const footer = (
      <ModalFooter >
        <Button
          onClick={handleSave}
          buttonStyle="primary"
          disabled={!isFormDataValid()}
          marginBottom0
        >
          <FormattedMessage id="close-continue-button" />
        </Button>
        {/* <Button 
          onClick={closeModalUnknownCust}
          marginBottom0
          >
          <FormattedMessage id="cancel-button" />
        </Button> */}
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
      label={<FormattedMessage id="modal-describe-unknown-customer-label" />}
      size="large"
      onClose={closeModalUnknownCust}
      footer={footer}
      contentClass={css.modalContent}
    >
        <Paneset>
        <Pane
          defaultWidth='fill'
        >
          <AccordionSet>
            <Accordion 
              label={
                <FormattedMessage id="modal-describe-unknown-customer-accordion-desc-cust-label" />
              }
            >
              <Row>
              <Col xs={3}>
                <TextField
                  onChange={handleChange}
                  value={formData.firstName}
                  name="firstName"
                  label={
                    <FormattedMessage id="modal-describe-unknown-customer.textField-first-name-label" />
                  }
                />
                <TextField
                  onChange={handleChange}
                  value={formData.lastName}
                  name="lastName"
                  label={
                    <FormattedMessage id="modal-describe-unknown-customer.textField-last-name-label" />
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <Editor
                    required
                    label={
                      <FormattedMessage id="modal-describe-unknown-customer.textArea-description-label" />
                    }
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    modules={editorModules}
                  />
              </Col>
            </Row>
            </Accordion>

            <Accordion
              label={
                <FormattedMessage id="modal-describe-unknown-customer-accordion-identity-details-label" />
              }
            >
              <Row>
                <Col xs={2}>
                  <TextField
                    label={<FormattedMessage id="modal-customer-details-sex" />}
                    name="sex"
                    value={formData.details.sex}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-race" />
                    }
                    name="race"
                    value={formData.details.race}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-height" />
                    }
                    name="height"
                    value={formData.details.height}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-weight" />
                    }
                    name="weight"
                    value={formData.details.weight}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-hair" />
                    }
                    name="hair"
                    value={formData.details.hair}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-eyes" />
                    }
                    name="eyes"
                    value={formData.details.eyes}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={3}>
                  <Datepicker
                    label={
                      <FormattedMessage id="modal-customer-details-date-of-birth" />
                    }
                    name="dateOfBirth"
                    value={formData.details.dateOfBirth}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: '25px', marginBottom: '100px' }}>
                <Col xs={4}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-street-address" />
                    }
                    name="streetAddress"
                    value={formData.details.streetAddress}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-city" />
                    }
                    name="city"
                    value={formData.details.city}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-state" />
                    }
                    name="state"
                    value={formData.details.state}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={2}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-customer-details-zipcode" />
                    }
                    name="zipcode"
                    value={formData.details.zipcode}
                    onChange={handleChange}
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

export default ModalDescribeCustomer;