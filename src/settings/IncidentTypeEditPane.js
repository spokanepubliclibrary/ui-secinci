import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
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
import GetSingleIncidentTypeDetails from './GetSingleIncidentTypeDetails';
import GetIncidentTypesDetails from './GetIncidentTypesDetails';
import GetIncidentCategories from './GetIncidentCategories';
import PutIncidentType from './PutIncidentType';
import { useIncidents } from '../contexts/IncidentContext';

const IncidentTypeEditPane = ({ handleCloseEdit, ...props }) => {

  const { incidentCategories } = useIncidents();
  const { id } = useParams();
  const [detailsData, setDetailsData] = useState(null);
  // const [incidentCategories, setIncidentCategories] = useState([]);
  const [allIncidentTypes, setAllIncidentTypes] = useState([]);
  const [formattedData, setFormattedData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
  });

  const handleFetchedDetails = (data) => {
    setDetailsData(data);
  };

  // const handleFetchedCategories = (data) => {
  //   setIncidentCategories(data);
  // };

  const handleIncidentTypes = (data) => {
    setAllIncidentTypes(data);
  };

  const dataOptions = incidentCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  useEffect(() => {
    if (detailsData) {
      setFormData({
        title: detailsData.title || '',
        category_id: detailsData.category_id || '',
        description: detailsData.description || '',
      });
    }
  }, [detailsData]);

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
    console.log("formData: ", JSON.stringify(formData, null, 2))
    const updatedIncidentTypes = allIncidentTypes.map((type) => {
      if (type.id === id) {
        return { 
          ...type, 
          ...formData
        };
      } else {
        return type;
      }
    });
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
        <FormattedMessage id="settings.incident-types-edit.paneTitle" />
      }
      onClose={handleCloseEdit}
    />
  );

  const footer = (
    <PaneFooter
      renderStart={
        <Button onClick={handleCloseEdit}>
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
      <GetSingleIncidentTypeDetails
        detailsId={id}
        handleFetchedDetails={handleFetchedDetails}
      />
      <GetIncidentCategories />
      <GetIncidentTypesDetails
        context="settings"
        handleIncidentTypes={handleIncidentTypes}
      />
      {formattedData && (
        <PutIncidentType
          data={formattedData}
          context="edit"
          handleCloseEdit={handleCloseEdit}
        />
      )}

      <AccordionSet>
        <Accordion
          label={
            <FormattedMessage id="settings.incident-types-edit.type-info-accordion-label" />
          }
        >
          <Row>
            <Col xs={8}>
              <Col>
                <TextField
                  required={true}
                  label={
                    <FormattedMessage id="settings.incident-types-edit.title-text-field-label" />
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
                  required={true}
                  label={
                    <FormattedMessage id="settings.incident-types-edit.category-select-label" />
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
                required={true}
                label={
                  <FormattedMessage id="settings.incident-types-edit.description-text-area-label" />
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

IncidentTypeEditPane.propTypes = {
  handleCloseEdit: PropTypes.func.isRequired,
};

export default IncidentTypeEditPane;
