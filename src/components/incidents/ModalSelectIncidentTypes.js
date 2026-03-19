import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Checkbox,
  Col,
  Modal,
  ModalFooter,
  Pane,
  Paneset,
  Row,
} from '@folio/stripes/components';
import IncidentTypeCard from './IncidentTypeCard';
import GetIncidentTypesDetails from '../../settings/GetIncidentTypesDetails';
import GetIncidentCategories from '../../settings/GetIncidentCategories';
import { useIncidents } from '../../contexts/IncidentContext';
import css from './ModalStyle.css';

const ModalSelectIncidentTypes = ({ handleIncidentTypeToggle, formDataIncidentTypes }) => {
  const { 
    isModalSelectTypesOpen, 
    closeModalSelectTypes, 
    incidentTypesList, // general list of available types, not an instance list
    incidentCategories 
  } = useIncidents();

  // for Checkbox filtering
  const [filterArgs, setFilterArgs] = useState([]);

  // handles Checkbox filtering
  const filterHandler = (event) => {
    if (event.target.checked) {
      setFilterArgs((prevArgs) => [...prevArgs, event.target.value]);
    } else {
      setFilterArgs((prevArgs) =>
        prevArgs.filter((arg) => arg !== event.target.value)
      );
    }
  };
  // handles Checkbox filtering
  const filteredList = incidentTypesList.filter((type) =>
    // if filterArgs is empty, new array has all incidentTypes (no filter)
    // else new array is only incidentTypes w/ that category_id(s)
    filterArgs.length > 0 ? filterArgs.includes(type.category_id) : true
  );

  if (!isModalSelectTypesOpen) {
    return null;
  };

  const handleTypeToggle = (typeObject) => {
    handleIncidentTypeToggle(typeObject)
    // allow keyboard only users immediate access to the close button on select
    document.getElementById('close-continue-button-access').focus();
  };

  const handleSave = () => {
    closeModalSelectTypes();
    setFilterArgs([]);
  };

  const handleCancelDismiss = () => {
    closeModalSelectTypes();
    setFilterArgs([]);
  };

  const chunkArray = (array, size) => {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
  };

  const chunkedIncidentTypes = chunkArray(filteredList, 3);

  const footer = (
    <ModalFooter
      className={css.customModalFooter}
      style={{ position: 'relative' }}
    >
      <Button
        id="close-continue-button-access"
        onClick={handleSave}
        buttonStyle="primary"
      >
        <FormattedMessage id="close-continue-button" />
      </Button>
      <Button onClick={handleCancelDismiss}>
        <FormattedMessage id="cancel-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        maxHeight: '90vh', 
        minHeight: '550px',
        overflow: 'hidden',
      }}
      open
      dismissible
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-incident-type-label" />}
      size="large"
      onClose={handleCancelDismiss}
      footer={footer}
      contentClass={css.modalContent}
    >
      <GetIncidentTypesDetails context="incidents" />
      <GetIncidentCategories />

      <div className={css.modalBody}>
        <Paneset style={{ height: '100%', flexGrow: 1 }}>
        <Pane
          defaultWidth="20%"
          paneTitle={
            <FormattedMessage id="modal-incident-type.filter-pane.paneTitle" />
          }
        >
        {incidentCategories.map((cat) => (
          <Checkbox 
            key={cat.id}
            label={cat.title} 
            value={cat.id} 
            onChange={filterHandler}
            />
        ))}

        </Pane>
        <Pane
          defaultWidth="80%"
          style={{ overflowY: 'auto', flexGrow: 1  }}
          paneTitle={
            <FormattedMessage id="modal-incident-type.incident-types-pane.paneTitle" />
          }
        >
          <div className={css.incidentTypeCardsContainer}>
            {chunkedIncidentTypes.map((row, rowIndex) => (
            <Row key={rowIndex}>
              {row.map((type, index) => {
                // in context of map, isSelected logic runs on each instance of a card, and each card will only have one opportunity to return true
                const isSelected = formDataIncidentTypes.some(
                  (selectedType) => selectedType.id === type.id
                );
                return (
                  <Col xs={4} key={type.id}>
                    <IncidentTypeCard
                      id={type.id}
                      category_id={type.category_id}
                      title={type.title}
                      description={type.description}
                      handleTypeToggle={handleTypeToggle}
                      isSelected={isSelected}
                    />
                  </Col>
                );
              })}
            </Row>
          ))}
          </div>
        </Pane>
      </Paneset>
      </div>
    </Modal>
  );
};

ModalSelectIncidentTypes.propTypes = {
  handleIncidentTypeSelection: PropTypes.func,
  currentInstanceIncidentTypes: PropTypes.arrayOf(PropTypes.object),
};

export default ModalSelectIncidentTypes;