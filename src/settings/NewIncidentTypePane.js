import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Accordion,
  AccordionSet,
  Button,
  Col,
  Pane,
  PaneHeader,
  PaneFooter,
  Row,
  Select,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import GetIncidentTypesDetails from './GetIncidentTypesDetails';
import GetIncidentCategories from './GetIncidentCategories';
import PutIncidentType from './PutIncidentType';
import makeId from './helpers/makeId';
import { useIncidents } from '../contexts/IncidentContext';

const NewIncidentTypePane = ({ handleCloseNew, ...props }) => {

  const { incidentCategories } = useIncidents();
  const [allIncidentTypes, setAllIncidentTypes] = useState([]);
  const [formattedData, setFormattedData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
  });

  const handleIncidentTypes = (data) => {
    setAllIncidentTypes(data);
  };

  const dataOptions = incidentCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormDataPresent = () => {
    return formData.title && formData.category_id && formData.description;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newIncidentType = {
      ...formData,
      id: makeId(formData.title),
    };
    const updatedIncidentTypes = [...allIncidentTypes, newIncidentType];

    const formattedReadyData = {
      data: {
        value: {
          incidentTypes: updatedIncidentTypes
        }
      }
    };
    setFormattedData(formattedReadyData);
  };

  const renderHeader = (renderProps) => (
    <PaneHeader
      {...renderProps}
      dismissible
      paneTitle={
        <FormattedMessage id="settings.incident-types.new.paneTitle" />
      }
      onClose={handleCloseNew}
    />
  );

  const footer = (
    <PaneFooter
      renderStart={
        <Button onClick={handleCloseNew}>
          <FormattedMessage id="cancel-button" />
        </Button>
      }
      renderEnd={
        <Button
          buttonStyle="primary"
          onClick={handleSubmit}
          disabled={!isFormDataPresent()}
        >
          <FormattedMessage id="save-and-close-button" />
        </Button>
      }
    />
  );

  return (
    <Pane defaultWidth="100%" renderHeader={renderHeader} footer={footer}>

      <GetIncidentCategories />
      
      <GetIncidentTypesDetails
        context="settings"
        handleIncidentTypes={handleIncidentTypes}
      />
      {formattedData && (
        <PutIncidentType
          data={formattedData}
          context="new"
          handleCloseNew={handleCloseNew}
        />
      )}

      <AccordionSet>
        <Accordion
          label={
            <FormattedMessage id="settings.incident-types.new.type-info-accordion-label" />
          }
        >
          <Row>
            <Col xs={8}>
              <Col>
                <TextField
                  required
                  label={
                    <FormattedMessage id="settings.incident-types.new.title-text-field-label" />
                  }
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </Col>
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <Col>
                <Select
                  required
                  label={
                    <FormattedMessage id="settings.incident-types.new.category-select-label" />
                  }
                  name="category_id"
                  value={formData.category_id}
                  placeholder="Select a category"
                  dataOptions={dataOptions}
                  onChange={handleChange}
                />
              </Col>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <TextArea
                required
                label={
                  <FormattedMessage id="settings.incident-types.new.description-text-area-label" />
                }
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{ width: '100%', height: '200px' }}
              />
            </Col>
          </Row>
        </Accordion>
      </AccordionSet>
    </Pane>
  );
};

NewIncidentTypePane.propTypes = {
  handleCloseNew: PropTypes.func.isRequired,
};

export default NewIncidentTypePane;
