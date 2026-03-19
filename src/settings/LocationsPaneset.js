import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory, Switch, Route } from 'react-router-dom';
import {
  AccordionSet,
  Accordion,
  Button,
  Col,
  Icon,
  Label,
  List,
  MessageBanner,
  MultiColumnList,
  Pane,
  Paneset,
  Row,
  Select,
  TextArea,
  TextField
} from '@folio/stripes/components';
import GetLocations from '../components/incidents/GetLocations';
import { useIncidents } from '../contexts/IncidentContext';
import GetLocationsInService from './GetLocationsInService'; 
import makeId from './helpers/makeId';
import PutLocationsInService from './PutLocationsInService';
import LocationInServiceEditPane from './LocationInServiceEditPane';

const LocationsPaneset = () => {
  const history = useHistory();
  const { 
    locations, 
    locationsInService,
    setLocationsInService
  } = useIncidents();
  const [locationsDataOptions, setLocationsDataOptions] = useState([]);
  const [selectValue, setSelectValue] = useState('');
  const [formattedData, setFormattedData] = useState(null);
  const [show, setShow] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [endOfListTotal, setEndOfListTotal] = useState(0);

  const [customLocationFormData, setCustomLocationFormData] = useState({
    id: '',
    location: '',
    subLocations: []
  });

  const [newSubLocation, setNewSubLocation] = useState({
    name: '',
    description: '',
  });

  const handleMessageBannerEntered = () => {
    setTimeout(() => {
      setShow(false)
      setShowErrorBanner(false)
    }, 2800)
  };
  
  const handleRemoveSubLocation = (index) => {
    const updatedSubLocations = customLocationFormData.subLocations.filter(
      (_, idx) => idx !== index
    );
    setCustomLocationFormData({ ...customLocationFormData, subLocations: updatedSubLocations });
  };

  const handleAddSubLocation = () => {
    if (newSubLocation && newSubLocation.name.trim() !== '') {
      const updatedSubLocations = [...customLocationFormData.subLocations, newSubLocation];
      setCustomLocationFormData({ ...customLocationFormData, subLocations: updatedSubLocations });
      setTimeout(() => {
        setNewSubLocation({ name: '', description: '' })
      }, 200);
    }
  };

  const handleNameInputChange = (e) => {
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

  useEffect(() => {
    if (locationsInService) {
      setEndOfListTotal(locationsInService.length);
    };
  }, [locationsInService])

  const items = customLocationFormData.subLocations.map((loc) => {
    return `${loc.name} - ${loc.description}`;
  });

  const itemFormatter = (item, index) => {
    return (
      <li key={index}>
        {item}
        <button
          onClick={() => handleRemoveSubLocation(index)}
          type="button"
          aria-label={<FormattedMessage 
            id="settings.locations-itemFormatter-aria-label" 
            values={{ item }}/>
          }
        >
          <Icon icon="trash" size="medium" />
        </button>
      </li>
    );
  };

  // const resultsFormatter = {
  //   subLocations: (item) => {
  //     const zonesCount = item.subLocations.length > 0 ? 
  //       item.subLocations.length : 0
  //     return zonesCount
  //   }
  // };

  const resultsFormatter = {
    subLocations: (item) => Array.isArray(item?.subLocations)
      ? item.subLocations.length
      : 0,
  };

  // filter, format and set locations for <Select /> dataOptions
  useEffect(() => {
    const selectPlaceholder = { 
      value: '', 
      label: <FormattedMessage 
        id="settings.selectComponent.placeholder.select-location"/>
    };
    const locationsInServiceSet = new Set(
      locationsInService.map(locInService => locInService.location)
    );
    const filteredLocations = locations.filter(
      loc => !locationsInServiceSet.has(loc)
    );
    const formatLocations = filteredLocations.map((loc) => {
      return { value: loc, label: loc }
    });
    setLocationsDataOptions([
      { ...selectPlaceholder }, 
      ...formatLocations
    ]);
    
  }, [locations, locationsInService]);

  const handleChange = (event) => {
    setSelectValue(event.target.value)
  };

  const makeLocationObj = (nameString) => {
    return {
      id: makeId(nameString), 
      location: nameString,
      subLocations: []
    }
  };

  const handleShowDetailsAsEditTest = (event, row) => {
    const id = row.id;
    history.push(`/settings/incidents/locations/${id}/edit`);
  };
  const handleCloseDetails = () => {
    history.push(`/settings/incidents/locations`);
  };
  const handleShowEdit = (id) => {
    history.push(`/settings/incidents/locations/${id}/edit`);
  };
  const handleCancelEdit = () => {
    history.push(`/settings/incidents/locations`);
  };
  const handleCloseEdit = () => {
    console.log("[STEP ?] handleCloseEdit RAN")
    history.push(`/settings/incidents/locations`);
  };

  const handleAddToService = () => {
    let updatedLocationsInService = [];
    const newInService = makeLocationObj(selectValue)
    const isDuplicate = locationsInService.some((loc) => loc.id === newInService.id);
    if (!isDuplicate) {
      updatedLocationsInService = [...locationsInService, newInService];
      setLocationsInService(updatedLocationsInService); // optimistic instant ui update
    }

    const readyFormattedData = {
      value: {  locationsInService: updatedLocationsInService }
    };
    setFormattedData({ data: readyFormattedData })
    setSelectValue('')
    setTimeout(() => setFormattedData(null), 1000);
  };

  const isOptInSelectPresent = (e) => {
    if (e) e.preventDefault();
    const isSelectValid = selectValue !== '';
    return isSelectValid;
  };

  const normalizeLocationName = (name) => {
    return name.toLowerCase().replace(/[\s\-_.,'"]/g, '');
  };

  const handleLocationInput = (event) => {
    const input = event.target.value;
    const normalizedInput = normalizeLocationName(input);
    const isNotNameUnique = locationsInService.some(loc => normalizeLocationName(loc.location) === normalizedInput);
    const isEmpty = input.trim() === '';
    const shouldDisable = isEmpty || isNotNameUnique; 
    setCustomLocationFormData(prevState => ({
      ...prevState,
      location: input
    }));
    setShowErrorBanner(isNotNameUnique);
    setIsButtonDisabled(shouldDisable);
  };

  useEffect(() => {
    if (customLocationFormData.location === '') {
      setIsButtonDisabled(true);
    }
  }, [])

  const handleAddCustomToService = () => {
    let updatedLocationsInService = [];
    const newInService = {
      ...customLocationFormData, 
      id: makeId(customLocationFormData.location)
    }
    const isDuplicate = locationsInService.some((loc) => loc.id === newInService.id);
    if (!isDuplicate) {
      updatedLocationsInService = [...locationsInService, newInService];
    } 
    // setLocationsInService(updatedLocationsInService); // optimistic instant ui update
    const readyFormattedData = {
      value: { locationsInService: updatedLocationsInService }
    };
    setFormattedData({ data: readyFormattedData})
    setCustomLocationFormData({
      id: '',
      location: '',
      subLocations: [],
    })
    setTimeout(() => setFormattedData(null), 1000);
  };

  return (
    <Paneset>
      <Pane 
      defaultWidth='fill'
      paneTitle={
        <FormattedMessage id="settings.locations.paneTitle"/>
      }>
        <GetLocations />
        <GetLocationsInService />
        {formattedData && 
          <PutLocationsInService 
            data={formattedData} 
            setShow={setShow}
            />}
        <AccordionSet>
          <Accordion label={<FormattedMessage id="settings.accordion.service-locations"/>}>
            <Row style={{ marginTop: '25px'}}>
              <Col xs={6}>
                <Select 
                  dataOptions={locationsDataOptions}
                  onChange={handleChange}
                  value={selectValue}
                />
              </Col>
              <Col xs={3}>
                <Button 
                  disabled={!isOptInSelectPresent()}
                  buttonStyle='primary'
                  onClick={handleAddToService}
                >
                <FormattedMessage id="settings.button.save-loc-to-service"/>
                </Button>
              </Col>
            </Row>

            <Row>
              <Col xs={10}>
              <div  style={{ height: '300px', width: 'auto' }}>
                <MultiColumnList 
                  autosize
                  // virtualize
                  // totalCount={endOfListTotal}
                  contentData={locationsInService}
                  formatter={resultsFormatter}
                  visibleColumns={['location', 'subLocations']}
                  columnMapping={{
                    location:  <FormattedMessage id="settings.locations.column-mapping.location"/>,
                    subLocations: <FormattedMessage id="settings.locations.column-mapping.subLocations"/>
                  }}
                  onRowClick={handleShowDetailsAsEditTest}
                  isEmptyMessage={<FormattedMessage id="settings.locations.MCL.is-empty-message"/>}
                  />
              </div>
              </Col>
            </Row>

            <Row style={{ marginTop: '25px', marginBottom: '25px' }}>
              <Col xs={8}>
                <div style={{ minHeight: '50px' }}>
                  <MessageBanner 
                    onEntered={() => handleMessageBannerEntered()}
                    type="success"
                    show={show}>
                    <FormattedMessage id="settings.locations.message-banner.success"/>
                  </MessageBanner>
                </div>
              </Col>
            </Row>
          </Accordion>

          <Accordion label={<FormattedMessage id="settings.locations.accordion.custom-locations"/>} >
            <Row style={{ marginTop: '20px' }}>
              <Col xs={6}>
                <Label id='label-name' style={{ marginBottom: '12px'}}>
                  <FormattedMessage id="settings.label.name"/>
                </Label>
                <TextField
                    aria-labelledby="label-name"
                    value={customLocationFormData.location}
                    onChange={handleLocationInput}
                  />
              </Col>
               <Col xs={6} style={{ marginTop: '20px' }}>
                <div>
                  <MessageBanner 
                    onEntered={() => handleMessageBannerEntered()}
                    type="error"
                    show={showErrorBanner}>
                     <FormattedMessage id="settings.locations-zones-messageBanner-error-msg"/>
                  </MessageBanner>
                </div>
              </Col>
            </Row>

            <Row style={{ marginTop: "20px"}}>
              <Col xs={4}>
               <Label id='label-zones'>
                  <FormattedMessage id="settings.label.zones"/>
                </Label>
                <List 
                  aria-labelledby="label-zones"
                  items={items} 
                  itemFormatter={itemFormatter} 
                  />
                <div>
                  <TextField
                    placeholder='Zone name'
                    value={newSubLocation.name}
                    onChange={handleNameInputChange}
                  />
                  <TextArea
                    placeholder='Zone description'
                    value={newSubLocation.description}
                    onChange={handleDescriptionInputChange}
                    style={{ marginTop: "20px" }}
                  />
                  <Button 
                    style={{ marginTop: "20px"}}
                    onClick={handleAddSubLocation}
                  >
                  <FormattedMessage id="settings.button.add-zone"/>
                  </Button>
                </div>
              </Col>
            </Row>

            <Row style={{ marginTop: '10px' }}>
              <Col xs={6}>
                <Button 
                  buttonStyle='primary'
                  onClick={handleAddCustomToService}
                  disabled={isButtonDisabled}
                  >
                  <FormattedMessage id="settings.button.save-new-custom-loc"/>
                  </Button>
              </Col>
            </Row>
          </Accordion>
        </AccordionSet>
        </Pane>

      <Switch>
        <Route 
          exact
          path="/settings/incidents/locations/:id/edit"
          render={(props) => (
            <LocationInServiceEditPane 
              handleCancelEdit={handleCancelEdit}
              handleCloseEdit={handleCloseEdit}
              {...props} 
           
              />
          )}/>
      </Switch>
    </Paneset>
  );
}

export default LocationsPaneset; 