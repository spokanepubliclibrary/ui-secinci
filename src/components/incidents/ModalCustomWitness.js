import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  Modal,
  Pane,
  Paneset,
  MessageBanner,
  ModalFooter,
  Row,
  TextField,
} from '@folio/stripes/components';
import css from './ModalStyle.css';
import { v4 as uuidv4 } from 'uuid';
import { useIncidents } from '../../contexts/IncidentContext';


const ModalCustomWitness = ({ 
  custWitViewObj, 
  custWitEditID, 
  custWitEditObj,
  setCustWitEditObj,
  setFormData,
  context,
}) => {
  const {
    isModalCustomWitness, 
    closeModalCustomWitness,
    setSelectedWitnesses,
    selectedWitnesses
  } = useIncidents();

  const [customWitForm, setCustomWitForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '',
    email: ''
  });

  // context of edit custom witness via CreatePane (selectedWitnesses)
  useEffect(() => {
    if (custWitEditID) {
      const witnessToEdit = selectedWitnesses.find(wit => wit.id === custWitEditID);
      if (witnessToEdit) {
        setCustomWitForm({
          firstName: witnessToEdit.firstName || '',
          lastName: witnessToEdit.lastName || '',
          role: witnessToEdit.role || '',
          phone: witnessToEdit.phone || '',
          email: witnessToEdit.email || ''
        });
      }
    }
  }, [custWitEditID, selectedWitnesses]);

  // context of view custom witness
  useEffect(() => {
    if (custWitViewObj) {
      setCustomWitForm({
        firstName: custWitViewObj.firstName || '',
        lastName: custWitViewObj.lastName || '',
        role: custWitViewObj.role || '',
        phone: custWitViewObj.phone || '',
        email: custWitViewObj.email || ''
      });
    }
  }, [custWitViewObj]);

  // context of edit custom witness 
  useEffect(() => {
    if (custWitEditObj) {
      setCustomWitForm({
        id: custWitEditObj.id || '',
        firstName: custWitEditObj.firstName || '',
        lastName: custWitEditObj.lastName || '',
        role: custWitEditObj.role || '',
        phone: custWitEditObj.phone || '',
        email: custWitEditObj.email || '',
        isCustom: true
      });
    }
  }, [custWitEditObj]);

  const [showPhoneError, setShowPhoneError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCustomWitForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleCancel = () => {
    setCustomWitForm({
      firstName: '',
      lastName: '',
      role: '',
      phone: '',
      email: ''
    });
    // setCustWitEditID();
    closeModalCustomWitness();
  };

  const handleCancelDetails = () => {
    closeModalCustomWitness();
  };

  const handleOnEntered =() => {
    setTimeout(() => {
      setShowPhoneError(false);
      setShowEmailError(false);
    }, 4000)
  };

  const validatePhoneNumber = (phone) => {
    // allow: 1234567890, 123-456-7890, 123 456 7890,
    // (123)456-7890, (123) 456-7890, 11234567890, 
    // +11234567890, +1 123 456 7890, +1-123-456-7890
    // not allow: too few digits, extra chars, leading zero country code,
    // incorrect placement of parens, more than 4 digits in last section
    const phoneRegex = /^(\+?[1-9]{1,2})?(\s|-)?\(?\d{3}\)?(\s|-)?\d{3}(\s|-)?\d{4}$/;
    return phoneRegex.test(phone)
  };

  const validateEmail = (email) => {
    // ensure local is one or more chars that are not space or @, 
    // ensure exactly one @,
    // ensure domain one or more chars not space or @,
    // ensure literal '.',
    // ensure TLD 2-6 chars
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const isFormDataPresent = () => {
    const isFirstNameValid = customWitForm.firstName && customWitForm.firstName !== '';
    const isLastNameValid = customWitForm.lastName && customWitForm.lastName !== '';
    return isFirstNameValid && isLastNameValid; 
  };

  // handle edit for uninstantiated (is local state) custom witness via CreatePane or EditPane
  const handleSave = () => {
    const phoneNumber = customWitForm.phone.trim(); 
    const email = customWitForm.email.trim();
    let hasError = false; 
    if (!validatePhoneNumber(phoneNumber) && phoneNumber !== '') {
      setShowPhoneError(true)
      hasError = true;
    } else {
      setShowPhoneError(false);
    };
    if (!validateEmail(email) && email !== '') {
      setShowEmailError(true)
      hasError = true;
    } else {
      setShowEmailError(false);
    };
    if (hasError) return; 

    const readyCustomWitness = {
      id: custWitEditID || uuidv4(),
      isCustom: true,
      firstName: customWitForm.firstName.trim(),
      lastName: customWitForm.lastName.trim(),
      ...(customWitForm.role.trim() ? { role: customWitForm.role.trim() } : {}),
      ...(customWitForm.phone.trim() ? { phone: customWitForm.phone.trim() } : {}),
      ...(customWitForm.email.trim() ? { email: customWitForm.email.trim() } : {}),
    };
    setSelectedWitnesses(prevData => {
      if (custWitEditID) {
        return prevData.map(wit => wit.id === custWitEditID ? 
        readyCustomWitness : wit);
      } else {
        return [...prevData, readyCustomWitness];
      }
    });
    setCustomWitForm({
      firstName: '',
      lastName: '',
      role: '',
      phone: '',
      email: ''
    });
    closeModalCustomWitness();
  };

  // handle add new
  const handleAddNewAtEdit = () => {
    const phoneNumber = customWitForm.phone.trim(); 
    const email = customWitForm.email.trim();
    let hasError = false; 
    if (!validatePhoneNumber(phoneNumber) && phoneNumber !== '') {
      setShowPhoneError(true)
      hasError = true;
    } else {
      setShowPhoneError(false);
    };
    if (!validateEmail(email) && email !== '') {
      setShowEmailError(true)
      hasError = true;
    } else {
      setShowEmailError(false);
    };
    if (hasError) return; 

    setSelectedWitnesses(prevData => {
      return [
      ...prevData, 
      {
        id: uuidv4(),
        isCustom: true,
        firstName: customWitForm.firstName.trim(),
        lastName: customWitForm.lastName.trim(),
        ...(customWitForm.role.trim() ? { role: customWitForm.role.trim() } : {}),
        ...(customWitForm.phone.trim() ? { phone: customWitForm.phone.trim() } : {}),
        ...(customWitForm.email.trim() ? { email: customWitForm.email.trim() } : {}),
      }
    ]
    });
    setCustomWitForm({
      firstName: '',
      lastName: '',
      role: '',
      phone: '',
      email: ''
    });
    closeModalCustomWitness();
  };

  // handle edit an instantiated custom witness via edit pane
  const handleSaveEditInstantiated = () => {
    const phoneNumber = customWitForm.phone; 
    const email = customWitForm.email;
    let hasError = false; 

    if (!validatePhoneNumber(phoneNumber) && phoneNumber !== '') {
      setShowPhoneError(true)
      hasError = true;
    } else {
      setShowPhoneError(false);
    };
    
    if (!validateEmail(email) && email !== '') {
      setShowEmailError(true)
      hasError = true;
    } else {
      setShowEmailError(false);
    };

    if (hasError) return; 

    setFormData(prevFormData => ({
      ...prevFormData,
      incidentWitnesses: prevFormData.incidentWitnesses.map(wit => wit.id === customWitForm.id ? { 
        ...customWitForm,
        isCustom: true,
        id: customWitForm.id,
        firstName: customWitForm.firstName.trim(),
        lastName: customWitForm.lastName.trim(),
        ...(customWitForm.role.trim() ? { role: customWitForm.role.trim() } : {}),
        ...(customWitForm.phone.trim() ? { phone: customWitForm.phone.trim() } : {}),
        ...(customWitForm.email.trim() ? { email: customWitForm.email.trim() } : {}),
        
      } : wit)
    }));
    setCustomWitForm({
      firstName: '',
      lastName: '',
      role: '',
      phone: '',
      email: ''
    });
    setCustWitEditObj({}); // set to empty to resolve edit an unsaved custom wit
    closeModalCustomWitness();
  };

  const footer = (
    <ModalFooter>
      <Button
        onClick={
          context === 'editSavedCustomWitness' ? handleSaveEditInstantiated 
          : context === 'addCustomWitAtEdit' ? handleAddNewAtEdit 
          : handleSave}
        buttonStyle="primary"
        disabled={!isFormDataPresent()}
        marginBottom0
      >
        <FormattedMessage id="close-continue-button" />
      </Button>
      <Button onClick={handleCancel}>
        <FormattedMessage id="cancel-button" />
      </Button>
    </ModalFooter>
  );

  const footerDetails = (
    <ModalFooter>
      <Button onClick={handleCancel}>
        <FormattedMessage id="close-button" />
      </Button>
    </ModalFooter>
  );

  const rowStyle = { marginTop: '10px', marginLeft: '20px'};

  if (!isModalCustomWitness) {
    return null;
  };

  if (custWitViewObj) {
    return (
      <Modal
        style={{ minHeight: '550px' }}
        open
        dismissible
        closeOnBackgroundClick
        label={<FormattedMessage id="modal-custom-witness-details-paneTitle" />}
        size="medium"
        onClose={handleCancelDetails}
        footer={footerDetails}
        contentClass={css.modalContent}
      >
      <Paneset>
        <Pane defaultWidth='fill'>
          <Row style={rowStyle}>
            <Col xs={6}>
              <strong>
                <FormattedMessage id="modal-custom-witness-firstName-details"/> 
              </strong> {custWitViewObj.firstName}
            </Col>
          </Row>
          <Row style={rowStyle}>
            <Col xs={6}>
              <strong>
                <FormattedMessage id="modal-custom-witness-lastName-details"/>
              </strong> {custWitViewObj.lastName}
            </Col>
          </Row>
          <Row style={rowStyle}>
            <Col xs={6}>
              <strong>
                <FormattedMessage id="modal-custom-witness-role-organization-details"/>
              </strong> {custWitViewObj.role}
            </Col>
          </Row>
          <Row style={rowStyle}>
            <Col xs={6}>
              <strong>
                <FormattedMessage id="modal-custom-witness-phone-details"/>
              </strong> {custWitViewObj.phone}
            </Col>
          </Row>
          <Row style={rowStyle}>
            <Col xs={6}>
              <strong>
                <FormattedMessage id="modal-custom-witness-email-details"/>
              </strong> {custWitViewObj.email}
            </Col>
          </Row>
        </Pane>
      </Paneset>
      </Modal>
    );
  };

  return (
    <Modal
      style={{ 
      minHeight: '550px', // minimum height when the browser is full size
      height: '80%', // allows modal to grow/shrink based on content
      maxHeight: '300vh',  // modal will never exceed 90% of viewport height
      maxWidth: '300vw', // modal width responsive to viewport width
      width: '60%' // modal width adjusts based on content and window size
    }}
      open
      dismissible
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-custom-witness-details-paneTitle" />}
      size="large"
      onClose={handleCancel}
      footer={footer}
      contentClass={css.modalContent}
    >
      <Paneset>
        <Pane>
          <Row style={rowStyle}>
            <Col xs={3}>
              <TextField
                required
                onChange={handleChange}
                value={customWitForm.firstName}
                name="firstName"
                label={<FormattedMessage id="modal-custom-witness-firstName-label"/>}
                // <FormattedMessage id="" />
              />
            </Col>
          </Row>
          <Row style={rowStyle}>
            <Col xs={3}>
              <TextField
                required
                onChange={handleChange}
                value={customWitForm.lastName}
                name="lastName"
                label={<FormattedMessage id="modal-custom-witness-lastName-label"/>}
              />
            </Col>
          </Row>
          <Row style={rowStyle}>
            <Col xs={3}>
              <TextField
                onChange={handleChange}
                value={customWitForm.role}
                name="role"
                label={<FormattedMessage id="modal-custom-witness-role-organization-label"/>}
              />
            </Col>
          </Row>
          <Row style={rowStyle}>
            <Col xs={3}>
              <TextField
                onChange={handleChange}
                value={customWitForm.phone}
                name="phone"
                label={<FormattedMessage id="modal-custom-witness-phone-label"/>}
              />
            </Col>
            <Col xs={3} style={{ marginTop: '18px'}}>
             <MessageBanner 
              onEntered={handleOnEntered}
              show={showPhoneError} 
              type='error'
              >
              <FormattedMessage id="modal-custom-witness-error-phone"/>
            </MessageBanner> 
            </Col>
          </Row>

          <Row style={rowStyle}>
            <Col xs={3}>
              <TextField
                onChange={handleChange}
                value={customWitForm.email}
                name="email"
                label={<FormattedMessage id="modal-custom-witness-email-label"/>}
              />
            </Col>
            <Col xs={3} style={{ marginTop: '18px'}}>
             <MessageBanner 
              onEntered={handleOnEntered}
              show={showEmailError} 
              type='error'
              >
               <FormattedMessage id="modal-custom-witness-error-email"/>
            </MessageBanner> 
            </Col>
          </Row>
        </Pane>
      </Paneset>
    </Modal>
  );
};

export default ModalCustomWitness;