import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  Button,
  Col,
  Icon,
  Label,
  MessageBanner,
  MultiColumnList,
  Pane,
  PaneHeader,
  Row,
  TextArea,
  TextField
} from '@folio/stripes/components';
import { useIncidents } from '../contexts/IncidentContext';
import PutLocationsInService from './PutLocationsInService';

const LocationInServiceEditPane = ({ handleCancelEdit, handleCloseEdit, ...props }) => {
  const { id } = useParams();
  const { 
    // institutionally set location names that are set outside of secinci app
    // bringing in for comparison 
    locations, 
    // opted-in locations for service and the custom locations 
    locationsInService
  } = useIncidents();

  const [detailsData, setDetailsData] = useState();
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isOriginOfInstitutionSettings, setIsOriginOfInsitutionSettings] = useState(false);
  const [formattedData, setFormattedData] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    location: '',
    subLocations: [],
  });
  const [newSubLocation, setNewSubLocation] = useState({
    name: '',
    description: '',
  });

  const getSingleLocationInServiceDetails = (list) => {
    const singleLocation = list.find((loc) => loc.id === id);
    setDetailsData(singleLocation);
  };

  useEffect(() => {
    if (locationsInService.length > 0) {
      getSingleLocationInServiceDetails(locationsInService)
    };
  }, [locationsInService]);

  // prevent an institutionally named location from being re-named in update by locking the TextField component (can only update a custom location name)
  // although the update api would not touch the institutionally set location name directly, we do not want overlap of names, or typos generated, etc 
  useEffect(() => {
    if(detailsData) {
      const isOriginOfInstition = locations.some((loc) => loc === detailsData.location);
      if(isOriginOfInstition) {
        setIsOriginOfInsitutionSettings(true)
      };
    };
  }, [detailsData, locations])

  useEffect(() => {
    if (detailsData) {
      setFormData({
        id: detailsData.id, 
        location: detailsData.location || '',
        subLocations: detailsData.subLocations || [],
      });
    }
  }, [detailsData]);

  const handleRemoveSubLocation = (index) => {
    const updatedSubLocations = formData.subLocations.filter(
      (_, idx) => idx !== index
    );
    setFormData({ ...formData, subLocations: updatedSubLocations });
  };

  const handleMessageBannerEntered = () => {
    setTimeout(() => {
      setShowErrorBanner(false)
    }, 2800)
  };

  const normalizeLocationName = (name) => {
    return name.toLowerCase().replace(/[\s\-_.,'"]/g, '');
  };

  const handleLocationInput = (event) => {
    const input = event.target.value;
    const normalizedInput = normalizeLocationName(input);
    const isNotNameUnique = locationsInService.some(loc => loc.location !== detailsData.location && normalizeLocationName(loc.location) === normalizedInput)

    setFormData({ ...formData, location: input })

    setShowErrorBanner(isNotNameUnique);
    setIsButtonDisabled(input.trim() === '' || isNotNameUnique)
  };

  const handleAddSubLocation = () => {
    if (newSubLocation && newSubLocation.name.trim() !== '') {
      const updatedSubLocations = [...formData.subLocations, newSubLocation];
      setFormData({ ...formData, subLocations: updatedSubLocations });
      setTimeout(() => {
        setNewSubLocation({ name: '', description: '' })
      }, 200);
    }
  };

  let endOflistTotal = 0;
  useEffect(() => {
    if (detailsData) {
      endOflistTotal = detailsData.subLocations.length;
    };
  }, [detailsData])


  const handleInputChange = (e) => {
    setNewSubLocation({
      ...newSubLocation,
      name: e.target.value
    });
  };

  const handleDescriptionInputChange = (e) => {
    setNewSubLocation({
      ...newSubLocation,
      description: e.target.value
    });
  };

  const handleSaveAndClose = () => {
    let updatedLocationsInService = [];
    const prevRemoved = locationsInService.filter((loc) => loc.id !== detailsData.id);
    const updatedLocation = { ...formData };
    updatedLocationsInService = [...prevRemoved, updatedLocation];

    const readyFormattedData = {
      data: {
        value: { 
          locationsInService: updatedLocationsInService 
        }
      }
    };

    setFormattedData(readyFormattedData);
    setTimeout(() => {
      handleCloseEdit();
    }, 800);
  };

  const MCLItems = formData.subLocations.map((loc, index) => {
    return ({ ...loc, index})
  });

  const subLocationsFormatter = {
    name: (item) => {
     const subLocName = item.name
     return subLocName
    },
    description: (item) => {
      return (
        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {item.description}
        </div>
      )
    }, 
    trash: (item) => {
      const name = item.name; 
      return ( 
      <button
        onClick={() => handleRemoveSubLocation(item.index)}
        aria-label={<FormattedMessage 
          id="settings.locations-edit-remove-sub-location-label" 
          values={{ name }}/>
        }
        type="button"
      >
        <Icon icon="trash" size="medium" />
      </button>)
    }
  };

  const columnWidths = {
    name: '100px',
    description: '50%',
    // description: { min: 100, max: 350 },
    trash: '88px'
  };

  const renderHeader = (renderProps) => (
    <PaneHeader
      {...renderProps}
      dismissible
      onClose={handleCancelEdit}
      paneTitle={<FormattedMessage 
        id="settings.custom-locations.edit.paneTitle" />
      }
    />
  );

  return (
    <Pane 
      defaultWidth='100%' 
      paneTitle='Edit location' 
      renderHeader={renderHeader}
    >
    
      {formattedData && 
        <PutLocationsInService 
          data={formattedData}
          />}
       <Row>
            <Col xs={6}>
              <Col>
                <TextField
                  readOnly={isOriginOfInstitutionSettings}
                  label={
                    <FormattedMessage id="settings.locations-edit-textfield-label" />
                  }
                  value={formData.location}
                  onChange={handleLocationInput}
                />
              </Col>
            </Col>
          </Row>
          <Row>
            <Col xs={10}>
                <Label
                  style={{ marginTop: '5px' }}
                  size="medium"
                  tag="h2"
                  id="location-zones"
                >
                 <FormattedMessage id="settings.locations-zones-label" />
                </Label>
            </Col>
          </Row>

          <Row>
            <Col xs={10}>
            <div style={{ height: '350px', width: 'auto' }}>
               <MultiColumnList 
                  autosize
                  virtualize
                  totalCount={endOflistTotal}
                  contentData={MCLItems}
                  visibleColumns={['name', 'description', 'trash']}
                  columnMapping={{
                    name: <FormattedMessage id="settings.locations-visibleColumns-name"/>,
                    description: <FormattedMessage id="settings.locations-visibleColumns-description"/>,
                    trash: ""
                  }}
                  formatter={subLocationsFormatter}
                  columnWidths={columnWidths}
                  isEmptyMessage={
                    <FormattedMessage 
                      id="settings.locations-MCL-isEmpty-msg"/>
                  }
                />
            </div>
            </Col>
          </Row>

          <Row style={{ marginTop: '25px' }}>
            <Col xs={8}>
              <div>
              <TextField
                placeholder='Zone name'
                value={newSubLocation.name}
                onChange={handleInputChange}
              />
              <TextArea
                placeholder='Zone description'
                value={newSubLocation.description}
                onChange={handleDescriptionInputChange}
                style={{ marginTop: "20px" }}
              />
              <Button onClick={handleAddSubLocation}>
                <FormattedMessage id="add-button" />
              </Button>
            </div>
            </Col>
          </Row>

          <Row style={{ marginTop: '25px', marginBottom: '25px' }}>
            <Col xs={8}>
              <div style={{ minHeight: '50px' }}>
                <MessageBanner 
                  onEntered={() => handleMessageBannerEntered()}
                  type="error"
                  show={showErrorBanner}>
                  <FormattedMessage id="settings.locations-zones-messageBanner-error-msg"/>
                </MessageBanner>
              </div>
            </Col>
          </Row>

          <Row style={{ marginTop: '30px' }}>
            <Col xs={4}>
              <Button 
                disabled={isButtonDisabled}
                buttonStyle='primary' 
                fullWidth
                onClick={handleSaveAndClose}
                >
                <FormattedMessage id="save-and-close-button" />
              </Button>
            </Col>
          </Row>
    </Pane>
  );
};

export default LocationInServiceEditPane;