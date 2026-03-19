import React, { useState, useEffect, useMemo } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useStripes } from '@folio/stripes/core';
import {
  Avatar,
  Button,
  Headline,
  Icon,
  KeyValue,
  Pane,
  PaneHeader,
  AccordionSet,
  Accordion,
  ExpandAllButton,
  Label,
  MetaSection,
  MessageBanner,
  Row,
  Col,
  LoadingPane,
  List,
} from '@folio/stripes/components';
import ProfilePicture from './helpers/ProfilePicture/ProfilePicture.js';
import GetDetails from './GetDetails';
import GetName from './GetName';
import GetNameCreatedBy from './GetNameCreatedBy';
import identifyCurrentTrespassDocs from './helpers/identifyCurrentTrespassDocs';
import GetLocationsInService from '../../settings/GetLocationsInService'; 
import GetIncidentTypesDetails from '../../settings/GetIncidentTypesDetails';
import ModalViewMedia from './ModalViewMedia';
import GetMedia from './GetMedia';
import Thumbnail from './Thumbnail';
import ThumbnailSkeleton from './ThumbnailSkeleton';
import ModalCustomWitness from './ModalCustomWitness';
// used for rendering instance values where only the date is considered:
import convertDateIgnoringTZ from './helpers/convertDateIgnoringTZ';
// convert for UI presentation: 
import convertUTCISOToPrettyDate from './helpers/convertUTCISOToPrettyDate';
// convert for UI presentation: 
import convertUTCISOToLocalePrettyTime from './helpers/convertUTCISOToLocalePrettyTime';
import sortTrespassDocuments from './helpers/sortTrespassDocuments.js';
import GetTrespassReasons from '../../settings/GetTrespassReasons';
import LinkedIncident from './LinkedIncident.js';
import { useIncidents } from '../../contexts/IncidentContext';

const DetailsPane = ({ 
  ...props 
}) => {
  const stripes = useStripes();
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();
  const intl = useIntl();
  const {
    singleIncident, setSingleIncident,
    closeDetailsPane,
    openEditPane,
    openLoadingDetails,
    isLoadingDetails,
    isModalViewImage,
    openModalViewImage,
    mode, 
    incidentTypesList,
    locationsInService,
    isImageArrayLoading, 
    openImageSkeleton, // set isImageArrayLoading to true
    closeImageSkeleton, // set isImageArrayLoading to false
    openModalCustomWitness, 
    documentError, 
    documentErrorMessage, 
    clearDocumentError,
    trespassReasons
  } = useIncidents();

  useEffect(() => {
    if (id) {
      setSingleIncident({})
      openLoadingDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const {
    incidentLocation = '',
    subLocation = '',
    dateTimeOfIncident = '',
    isApproximateTime = false,
    incidentWitnesses = [],
    detailedDescriptionOfIncident = '',
    customers = [],
    incidentTypes = [],
    attachments = [],
    createdBy = {},
    metadata = {},
    staffSuppressed = Boolean,
    linkedToSummary = []
  } = singleIncident;

  // console.log("singleIncident --> ", JSON.stringify(singleIncident, null, 2))

  const hasViewProfilePicturePerm = stripes.hasPerm('ui-users.profile-pictures.view');
  const [incTypeTitles, setIncTypeTitles] = useState([]);
  const [locName, setLocName] = useState('');
  const [modalViewImageData, setModalViewImageData] = useState({});
  const [mediaSrc, setMediaSrc] = useState({});
  const [mediaArray, setMediaArray] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState({});
  const [documents, setDocuments] = useState([]);
  const [mostCurrentTrespassDocIds, setMostCurrentTrespassDocIds] = useState([]);
  const [associatedKeyCustArray, setAssociatedKeyCustArray] = useState([]);
  const [associatedKeyWitArray, setAssociatedKeyWitArray] = useState([]);
  const [customersForRender, setCustomersForRender] = useState([]);
  const [witnessesForRender, setWitnessesForRender] = useState([]);
  const [createdById, setCreatedById] = useState('');
  const [updatedById, setUpdatedById] = useState('');
  const [readyCreatedByInUI, setReadyCreatedByinUI] = useState(null);
  const [custWitViewObj, setCustWitViewObj] = useState({});
  const [missingUsers, setMissingUsers] = useState([]);
  const [createdByForRender, setCreatedByForRender] = useState({
    id: '',
    barcode: '',
    firstName: '',
    lastName: ''
  }); // leveraged for both record 'createdBy' key and MetaSection 'createdBy' 
  const [updatedByForRender, setUpdatedByForRender] = useState({
    id: '',
    barcode: '',
    firstName: '',
    lastName: ''
  }); // leveraged for MetaSection 'lastUpdatedBy'

  useEffect(() => {
    if (customers) {
      const readyDataCustomers = customers.map((dataObj) => {
        // handle names if not registered
        if(!dataObj.registered) {
          return {
            ...dataObj,
            associatedFirstName: dataObj.firstName,
            associatedLastName: dataObj.lastName,
            profilePicLinkOrUUID: '' // Not registered, couldn't have profile pic
          }
          // handle if registered and associatedKeyCustArray has values to work with
        } else if (dataObj.registered 
          && associatedKeyCustArray 
          && associatedKeyCustArray.length > 0) {
          const matchingCust = associatedKeyCustArray.find(
            (cust) => cust.id === dataObj.id
          );
          if (matchingCust) {
            // return a matched customer with associated names
            return {
              ...dataObj,
              associatedFirstName: matchingCust.firstName,
              associatedLastName: matchingCust.lastName,
              profilePicLinkOrUUID: matchingCust.profilePicLinkOrUUID
            };
          }
        };
        // otherwise return obj
        return dataObj;
      });
      setCustomersForRender(readyDataCustomers)
    };
  }, [customers, associatedKeyCustArray])

  useEffect(() => {
    if(associatedKeyWitArray && associatedKeyWitArray.length > 0) {
      const readyDataWitnesses = incidentWitnesses.map((dataObj) => {
        const matchingWit = associatedKeyWitArray.find(
          (wit) => wit.id === dataObj.id
        );
        if(matchingWit) {
          return {
            ...dataObj,
            associatedFirstName: matchingWit.firstName,
            associatedLastName: matchingWit.lastName
          };
        }
        return dataObj;
      });
      setWitnessesForRender(readyDataWitnesses)
    }
  }, [incidentWitnesses, associatedKeyWitArray]);

  const associatedKeyPlaceSigned = (value) => {
    // value is expected to tbe the id associated w/ locationInService obj
    const locObject = locationsInService.find(loc => loc.id === value)
    // return the obj's location (which is the pretty name)
    return locObject ? locObject.location : '';
  };

  useEffect(() => {
    if(createdBy && createdBy.id !== '') {
     setCreatedById(createdBy.id)
    }
  }, [createdBy]);

  useEffect(() => {
    if(metadata && 'updatedByUserId' in metadata && metadata.updatedByUserId !== '') {
     setUpdatedById(metadata.updatedByUserId)
    }
  }, [metadata]);

  useEffect(() => {
    if(attachments && attachments.length > 0) {
      const docs = attachments.filter((att) => att.contentType.startsWith('application'));
      setDocuments(docs);

      const medias = attachments.filter((att) => att.contentType.startsWith('image') || att.contentType.startsWith('video'));
      setMediaArray(medias);

      const newLoadingStatus = medias.reduce((acc, att) => ({
        ...acc,
        [att.id]: true  // start all media as loading true
      }), {});
      setLoadingStatus(newLoadingStatus);

      openImageSkeleton();
    } else {
      setDocuments([]);
      setMediaArray([]);
      setMediaSrc({});
      setLoadingStatus({});
      closeImageSkeleton();
    }
  }, [attachments]);

  const sortedDocuments = useMemo(() => sortTrespassDocuments(documents, mostCurrentTrespassDocIds), [documents, mostCurrentTrespassDocIds])


  const handleMediaUrl = (mediaUrl, attachmentId) => {
    setMediaSrc(prev => ({ ...prev, [attachmentId]: mediaUrl }));
    setLoadingStatus(prev => ({ ...prev, [attachmentId]: false }));
  };

  useEffect(() => {
    const allImagesLoaded = Object.values(loadingStatus).every(status => !status);
    if (allImagesLoaded) {
      closeImageSkeleton();

    }
  }, [loadingStatus, closeImageSkeleton]);


  useEffect(() => {
    if (documents && documents.length > 0) {
      const startStr = 'trespass-';
      const current = identifyCurrentTrespassDocs(documents, startStr);
      setMostCurrentTrespassDocIds(current);
    }
  }, [documents]);

  const thumbnailStyle = { width: '100px', height: 'auto', objectFit: 'cover'};

  useEffect(() => {
    if(singleIncident && singleIncident.incidentLocation) {
      const locObject = locationsInService.find(loc => loc.id === singleIncident.incidentLocation);
      const name = locObject && locObject.location ? locObject.location : "unknown"
      setLocName(name)
    }
  }, [singleIncident, incidentLocation, locationsInService])

  useEffect(() => {
    const ready = singleIncident?.incidentTypes?.length &&
      incidentTypesList?.length;
    if (!ready) {
      setIncTypeTitles([]);
      return 
    };

    const byId = new Map(
      (incidentTypesList ?? []).map(t => [t.id, t])
    );

    const fullTypes = singleIncident.incidentTypes.map(({ id }) => {
      const found = byId.get(id);
      return found ?? { 
        id, 
        title: <FormattedMessage id="incident-type-not-found-fallback" 
          values={{ id }}/>,
       description: '' 
      };
    });

    setIncTypeTitles(fullTypes);
  }, [singleIncident, incidentTypesList]);

  const incTypeFormatter = (item, index) => {
    if (!item) {
      return null; 
    };
    return (
      <li key={item.id ?? index}>
      {item.title ? item.title : 'error'} {item.description ? item.description : ''}
      </li>
    )
  };

  const handleMissingUsers = (userId) => {
    setMissingUsers((prev) => {
     return [ ...prev, userId]
    })
  };

  const handleGetCustName = (userObj) => {
    setAssociatedKeyCustArray((prevState) => {
      return [...prevState, userObj]
    })
  };

  const handleGetWitnessName = (witObj) => {
    setAssociatedKeyWitArray((prevState) => {
      return [...prevState, witObj]
    })
  };

  const handleShowCustomWitModalAsDetails = (witObj) => {
    setCustWitViewObj(witObj)
    openModalCustomWitness()
  };

  const handleGetCreatedByName = (createdByNameObj) => {
    if (createdByNameObj) {
      setCreatedByForRender({
        id: createdByNameObj.id,
        barcode: createdByNameObj.barcode,
        firstName: createdByNameObj.firstName,
        lastName: createdByNameObj.lastName
      })
    } else {
      setCreatedByForRender({
        id: '',
        barcode: '',
        firstName: '',
        lastName: ''
      })
    }
  };

  const handleGetUpdatedByName = (updatedByNameObj) => {
    if (updatedByNameObj) {
      setUpdatedByForRender({
        id: updatedByNameObj.id,
        barcode: updatedByNameObj.barcode,
        firstName: updatedByNameObj.firstName,
        lastName: updatedByNameObj.lastName
      })
    } else {
      setUpdatedByForRender({
        id: '',
        barcode: '',
        firstName: '',
        lastName: ''
      })
    }
  };

  const witnessNames = witnessesForRender.map((wit) => {
    const name = `${wit.associatedLastName}, ${wit.associatedFirstName}`;
    return name;
  });

  const makeCreatedByLink = (createdByObject) => {
    if (createdByObject.id && createdByObject.id !== '') {
      return (
        <a 
        href={`/users/preview/${createdByObject.id}`}
        target="_blank"
        aria-label="Link to created by in users application"
        style={{
          textDecoration: 'none',
          color: 'rgb(0,0,238)',
          fontWeight: 'bold',
        }}
        rel="noreferrer"
        >
          {`${createdByObject.lastName}, ${createdByObject.firstName}`}
        </a>
      )
    } else {
      return <Icon icon='spinner-ellipsis' size='small'></Icon>
    }
  };

  useEffect(() => {
    if (createdByForRender) {
      setReadyCreatedByinUI(makeCreatedByLink(createdByForRender));
    }
  }, [createdByForRender]) // on render

  const witnessItemFormatter = (wit) => {
    const isCustomWitness = wit.isCustom === true; 
    return (
      <li key={wit.id}>
      {isCustomWitness ? (
        <>
        {wit.lastName}, {wit.firstName} 
        <button
          style={{ paddingLeft: '15px' }}
          onClick={() => handleShowCustomWitModalAsDetails(wit)}
          type="button"
        >
          <Icon icon="report" size="medium" /> 
          <FormattedMessage id="view-details-custom-witness"/>
        </button>
        </>
      ) : <a 
          href={`/users/preview/${wit.id}`}
          target="_blank"
          aria-label="Link to created by in users application"
          style={{
            textDecoration: 'none',
            color: 'rgb(0,0,238)',
            fontWeight: 'bold',
          }}
          rel="noreferrer"
        >
        {`${wit.associatedLastName}, ${wit.associatedFirstName}`}
      </a>
      }
      </li>
    )
  };

  const style = {
    display: 'block',
    width: '50%',
    marginTop: '10px',
  };

  const handleDismissDetails = () => {
    setCreatedByForRender({
      id: '',
      barcode: '',
      firstName: '',
      lastName: ''
    });
    setUpdatedByForRender({
      id: '',
      barcode: '',
      firstName: '',
      lastName: ''
    });
    setCreatedById('');
    setUpdatedById('');
    closeDetailsPane();
    setSingleIncident({});
    clearDocumentError();
    setMissingUsers([]);
    setMediaSrc({});
    setMediaArray([]);
    setLoadingStatus({});

    setDocuments([]);
    closeImageSkeleton();

    const lastListRoute = sessionStorage.getItem('lastTrackListRoute');

    if (mode === 'createMode') {
      history.push(`/incidents?limit=20&offset=0`);
    } else if (lastListRoute && lastListRoute.startsWith('/incidents')) {
      sessionStorage.removeItem('lastTrackListRoute');
      history.push(lastListRoute);
    } else {
      history.push(`/incidents?limit=20&offset=0`);
    }
  };

  const handleOpenEdit = (incidentId) => {
    closeDetailsPane();
    setAssociatedKeyCustArray([]);
    setCustomersForRender([]);
    setSingleIncident({});
    setCreatedById('')
    openEditPane();
    clearDocumentError();
    setMissingUsers([]);
    setMediaSrc(null);
    setMediaArray(null);
    setLoadingStatus(null);
    history.replace(`/incidents/${incidentId}/edit${location.search}`);
  };

  const handleImageClick = (imageObj) => {
    setModalViewImageData(imageObj)
    openModalViewImage();
  };

  const createMarkup = (content) => {
    return {__html: content}
  };

  const witnessesListLabel = intl.formatMessage(
    { id: `witnesses-list-label` },
    { count: witnessNames.length,  
      bold: (chunks) => (
        <strong style={{ color: '#A12A2A' }}>{chunks}</strong>
      ) 
    }
  );

  const incidentTypesListLabel = intl.formatMessage(
    { id: `incident-types-list-label` },
    { count: incTypeTitles.length }
  );

  const getActionMenu = ({ onToggle }) => (
    <>
        <Button
          buttonStyle="primary"
          style={style}
          onClick={() => handleOpenEdit(id)}
        >
        <FormattedMessage id="edit-button" />
      </Button>
    </>
  );

  const actionMenu = stripes.hasPerm('ui-security-incident.edit') 
    ? getActionMenu 
    : undefined; 

  const trById = useMemo(
    () => new Map(
    (trespassReasons ?? []).map(tr => [tr.id, tr])
  ), [trespassReasons]);

  
  const itemsFormatterExclusionList = (item) => {
    const found = trById.get(item.id);
    // item.reason is persisted fallback clear text
    return <li key={item} style={{ marginLeft: '10px' }}>{found?.reason ?? item.reason}</li>;
  };

  return (
    <>
      {id && 
        <GetDetails id={id} 
        />}

      {customers.map((cust) => {
        // if customer is not registered (not in /Users db) then skip that cust object and return null (handled in useEffect instead)
        if (!cust.registered) {
          return null;
        };
        return (
          <GetName 
            key={cust.id}
            uuid={cust.id} 
            handleGetCustName={handleGetCustName} 
            handleMissingUsers={handleMissingUsers}
            context='customer'/>
        );
      })}

      {incidentWitnesses.map((wit) => (
        <GetName
          isCustomWitness={wit.isCustom === true ? wit : null}
          key={wit.id}
          uuid={wit.id}
          handleGetWitnessName={handleGetWitnessName}
          handleMissingUsers={handleMissingUsers}
          context="witness"
        />
      ))}

      {updatedById && updatedById !== '' && (
        <GetName 
          uuid={updatedById}
          handleGetUpdatedByName={handleGetUpdatedByName}
          handleMissingUsers={handleMissingUsers}
          context="updatedBy"
        />
      )}

      {createdById && createdById !== '' && (
        <GetNameCreatedBy 
          uuid={createdById}
          handleGetCreatedByName={handleGetCreatedByName}
          handleMissingUsers={handleMissingUsers}
        />
      )}

      {isLoadingDetails || singleIncident?.id !== id ? (
        <LoadingPane
          defaultWidth="fill"
          paneTitle={
            <FormattedMessage id="details-pane.loading-pane-paneTitle" />
          }
        />
      ) : (
        <Pane
          key={id}
          paneTitle={<FormattedMessage id="details-pane.paneTitle" />}
          defaultWidth="fill"
          {...props}
          renderHeader={(renderProps) => (
            <PaneHeader
              {...renderProps}
              dismissible
              onClose={handleDismissDetails}
              paneTitle={<FormattedMessage id="details-pane.pane-header-paneTitle" />}
              actionMenu={actionMenu}
            />
          )}>
          {custWitViewObj && Object.keys(custWitViewObj).length > 0 && (
            <ModalCustomWitness 
              custWitViewObj={custWitViewObj}
            />
          )}
          {isModalViewImage && 
            modalViewImageData && 
            <ModalViewMedia 
              modalViewImageData={modalViewImageData}
            />
          }
          <GetIncidentTypesDetails context='incidents'/>
          <GetLocationsInService />
          <GetTrespassReasons />

          {/* if 404 for any /Users request get associated key for name, render MessageBanner with message and those unfound uuid(s) */}
          <Row>
            <Col xs={12}>
              <div>
                <MessageBanner 
                  dismissible
                  type="error"
                  show={missingUsers.length > 0}
                  >
            {<FormattedMessage 
              id="message-banner.error-missing-users-404"
              values={{ ids: missingUsers.join(', ') }}
              />}
                </MessageBanner>
              </div>
            </Col>
          </Row>

          {/* if documentError render MessageBanner for documentErrorMessage */}
          <Row>
            <Col xs={12}>
              <div>
                <MessageBanner 
                  dismissible
                  onExit={() => clearDocumentError()}
                  type="error"
                  show={documentError}
                  >
            {<FormattedMessage 
              id="details-pane.error-generate-trespass-doc" 
              values={{ documentErrorMessage }}
              />}
                </MessageBanner>
              </div>
            </Col>
          </Row>

          <AccordionSet>
            <ExpandAllButton />
            <MetaSection
              headingLevel={4}
              useAccordion
              showUserLink
              createdDate={metadata.createdDate || null}
              lastUpdatedDate={metadata.updatedDate || null}
              createdBy={{
                id: metadata.createdByUserId,
                personal: {
                  firstName: createdByForRender.firstName,
                  lastName: createdByForRender.lastName
                }
              }} 
              lastUpdatedBy={{
                id: metadata.updatedByUserId,
                personal: {
                  firstName: updatedByForRender.firstName,
                  lastName: updatedByForRender.lastName,
                }
              }}
            />

            {staffSuppressed && staffSuppressed === true ? (
              <div style={{ display: 'inline-block' }}>
                <Icon size='small' icon='exclamation-circle' status='warn'>
                </Icon>
                <span style={{ marginLeft: '0.5rem' }}>
                    <FormattedMessage id="details-pane.staff-suppressed" />
                </span>
              </div> 
            ) : (
              null
            )}

            <Accordion label={<FormattedMessage id="accordion-label-media" />}>
              <div>
                {mediaArray?.map((attachment) => (
                  <GetMedia 
                    context='thumbnail'
                    contentType={attachment.contentType}
                    key={attachment.id}
                    id={id}
                    imageId={attachment.id}
                    mediaHandler={(mediaUrl) => handleMediaUrl(mediaUrl, attachment.id)}
                  />
                ))}
              </div>           
              
              <Row style={{ margin: '25px' }}>
                <Col xs={1} style={{ visibility: 'hidden' }}></Col>
                {mediaArray?.slice(0, 5).map((attachment) => (
                  <Col xs={2} key={attachment.id}>
                  {loadingStatus[attachment.id] && isImageArrayLoading ? <ThumbnailSkeleton />
                  : <Thumbnail
                      key={attachment.id}
                      context='details'
                      src={mediaSrc[attachment.id]}
                      alt={attachment.description}
                      imageDescription={attachment.description}
                      contentType={attachment.contentType}
                      style={thumbnailStyle}
                      handler={() => handleImageClick({
                        "id": id,
                        "imageId": attachment.id,
                        "key": attachment.id, 
                        "alt": attachment.description,
                        "contentType": attachment.contentType,
                        "imageDescription": attachment.description
                      })} 
                    />
                  }
                  </Col>
                ))}
              </Row>
              <Row style={{ margin: '25px' }}>
                <Col xs={1} style={{ visibility: 'hidden' }}></Col>
                {mediaArray?.slice(5, 10).map((attachment) => (
                  <Col xs={2} key={attachment.id}>
                  {loadingStatus[attachment.id] && isImageArrayLoading ? <ThumbnailSkeleton />
                  : <Thumbnail
                      key={attachment.id}
                      context='details'
                      src={mediaSrc[attachment.id]}
                      alt={attachment.description}
                      imageDescription={attachment.description}
                      handler={() => handleImageClick({
                        "id": id,
                        "imageId": attachment.id,
                        "key": attachment.id, 
                        "alt": attachment.description,
                        "contentType": attachment.contentType,
                        "imageDescription": attachment.description
                      })} 
                      contentType={attachment.contentType}
                      style={thumbnailStyle}
                    />
                  }
                  </Col>
                ))}
              </Row>
            </Accordion>
            <Accordion
              label={singleIncident && singleIncident.customerNa === true ? <FormattedMessage id="accordion-label-no-associated-customers"/> 
              : <FormattedMessage id="accordion-label-customers" />}
            >

            <div style={{ padding: '15px' }}>
              <Row>
                <Col xs={10}>
                {customersForRender.map((cust) => {
                  // init if trespass and trespass has end date
                  const endDateOfTrespassISO = cust.trespass ? cust.trespass.endDateOfTrespass : null;

                  // make pretty for UI if end date iso exists
                  const endDateOfTrespassPretty = endDateOfTrespassISO ? convertDateIgnoringTZ(endDateOfTrespassISO) : null;

                  // init as new Date obj if end date iso exists (for comparison)
                  const endDateOfTrespass = endDateOfTrespassISO ? new Date(endDateOfTrespassISO) : null; 

                  // compare for is expired else false
                  const isTrespassExpired = endDateOfTrespass ? endDateOfTrespass.getTime() < Date.now() : false;

                  const isTrespassed = !!cust.trespass; 
                  const isDeclarationOfService = cust.trespass && 
                    cust.trespass.declarationOfService &&
                    Object.keys(cust.trespass.declarationOfService).length > 0;

                  // NOTE: via useEffect associated first and last names are set for un-registered customers with their incident report instance value
                  // whereas registered customers associated first and last names are set by current value of their /Users instance value
                  const { associatedFirstName, associatedLastName } = cust;
                  const notAvailable = intl.formatMessage({ id: "unknown-name-placeholder" }); 
                  const displayedFirstName = associatedFirstName === '' ? notAvailable : associatedFirstName; 
                  const displayedLastName = associatedLastName === '' ? notAvailable : associatedLastName; 
                  let keyedName = `${displayedLastName}, ${displayedFirstName}`; 

                  
                  let trespassStatus = ''
                  if (isTrespassed) {
                    if (!isTrespassExpired) {
                      trespassStatus = (<FormattedMessage 
                        id="details-pane.trespass-active-until" 
                        values={{ date: endDateOfTrespassPretty}}/>)
                    } else {
                      trespassStatus = (<FormattedMessage 
                        id="details-pane.trespass-expired" 
                        values={{ date: endDateOfTrespassPretty}}/>)
                    }
                  };
                  const isKnown = cust.registered === true; 

                  return (
                    <Accordion 
                      key={cust.id}
                      label={!isKnown ? <>
                       {keyedName}
                       <span 
                          style={{ 
                            marginLeft: '10px', 
                            marginRight: '10px'
                          }}
                          >
                          {trespassStatus}
                        </span>
                        {isTrespassed && !isTrespassExpired && (
                          <span style={{ 
                            marginLeft: '10px', 
                            marginRight: '10px', 
                            color: 'red'}}>
                            <Icon icon='times-circle-solid' size='small'></Icon>
                          </span>
                        )} 
                      </> : <>
                        <a
                        href={`/users/preview/${cust.id}`}
                        target="_blank"
                        aria-label="Link to customer in users application"
                        style={{
                            textDecoration: 'none',
                            color: 'rgb(0,0,238)',
                            fontWeight: 'bold',
                          }}
                        rel="noreferrer"
                        >
                          {keyedName}
                        </a>
                        <span 
                          style={{ 
                            marginLeft: '10px', 
                            marginRight: '10px'
                          }}
                          >
                          {trespassStatus}
                        </span>
                        {isTrespassed && !isTrespassExpired && (
                          <span style={{ 
                            marginLeft: '10px', 
                            marginRight: '10px', 
                            color: 'red'}}>
                            <Icon icon='times-circle-solid' size='small'></Icon>
                          </span>
                        )} 
                      </>}>

                      <Row style={{ marginTop: '15px' }}> 
                        <Col xs={4}>
                          <Headline size="medium" tag="h2">
                          {cust.description ? (<FormattedMessage id="details-pane.customersForRender-cust-description" />) : (<FormattedMessage id="details-pane.customersForRender-no-cust-description" />)}
                          </Headline>
                          {cust.description ? (
                          <div 
                            dangerouslySetInnerHTML={createMarkup(cust.description)}>
                          </div>) 
                          : null
                          }
                        </Col>

                       {hasViewProfilePicturePerm && (
                          <Col xs={6}>
                            <KeyValue 
                              label={<FormattedMessage id="ui-users.information.profilePicture" />}
                              value={ 
                                <ProfilePicture 
                                  profilePictureLink={cust.profilePicLinkOrUUID}
                              />}
                            />
                          </Col>
                       )}
                      </Row>

                      <Row style={{ marginTop: '15px' }}>
                        <Col xs={4}>
                        <Headline size="medium" tag="h2">
                          {cust.details && Object.values(cust.details).some(value => value !== '' && value !== null) ? (<FormattedMessage id="details-pane.customersForRender-identity-details" />) : (<FormattedMessage id="details-pane.customersForRender-no-identity-details" />) }
                          </Headline>
                        </Col>
                      </Row>

                    {cust.details && Object.values(cust.details).some(value => value !== '' && value !== null) ? (
                      <>
                      <Row>
                        <Col xs={2}>
                          <Headline size="medium" tag="h2">
                            <FormattedMessage id="modal-view-customer-details.headline-sex" />
                          </Headline>
                          <p>
                          {cust.details && cust.details.sex ? cust.details.sex : '-'}
                          </p>
                        </Col>

                        <Col xs={2}>
                          <Headline size="medium" tag="h2">
                            <FormattedMessage id="modal-view-customer-details.headline-race" />
                          </Headline>
                          <p>
                            {cust.details && cust.details.race ? cust.details.race : '-'}
                          </p>
                        </Col>
                        <Col xs={2}>
                          <Headline size="medium" tag="h2">
                            <FormattedMessage id="modal-view-customer-details.headline-height" />
                          </Headline>
                          <p>
                            {cust.details && cust.details.height
                              ? cust.details.height
                              : '-'}
                          </p>
                        </Col>
                      </Row>

                      <Row style={{ marginTop: '10px' }}>
                        <Col xs={2}>
                          <Headline size="medium" tag="h2">
                            <FormattedMessage id="modal-view-customer-details.headline-weight" />
                          </Headline>
                          <p>
                            {cust.details && cust.details.weight
                              ? cust.details.weight
                              : '-'}
                          </p>
                        </Col>
                        <Col xs={2}>
                          <Headline size="medium" tag="h2">
                            <FormattedMessage id="modal-view-customer-details.headline-hair" />
                          </Headline>
                          <p>
                            {cust.details && cust.details.hair ? cust.details.hair : '-'}
                          </p>

                        </Col>
                        <Col xs={2}>
                          <Headline size="medium" tag="h2">
                            <FormattedMessage id="modal-view-customer-details.headline-eyes" />
                          </Headline>
                          <p>
                            {cust.details && cust.details.eyes ? cust.details.eyes : '-'}
                          </p>
                        </Col>
                        <Col xs={2}>
                          <Headline size="medium" tag="h2">
                            <FormattedMessage id="modal-view-customer-details.headline-date-of-birth" />
                          </Headline>
                          <p>
                            {cust.details && cust.details.dateOfBirth ? convertDateIgnoringTZ(cust.details.dateOfBirth) : '-'}
                          </p>
                        </Col>
                      </Row>
                      </>
                    ) 
                    : null
                    }

                {/* TRESPASS DETAILS */}
                  <Row style={{ marginTop: '15px' }}>
                      <Col xs={4}>
                      <Headline size="medium" tag="h2">
                          {cust.trespass && Object.values(cust.trespass).some(value => value !== '' && value !== null) ? (<FormattedMessage id="details-pane.customersForRender-trespass-details" />) : (<FormattedMessage id="details-pane.customersForRender-no-trespass-details" />) }
                        </Headline>
                      </Col>
                    </Row>
                {isTrespassed ? (
                  <>
                    <Row style={{ marginLeft: ' 15px' }}>
                      <Col xs={4}>
                        <Headline size="medium" tag="h3">
                          <FormattedMessage id="modal-view-trespass.headline-exclusion-based-on" />
                        </Headline>
                        <List
                          label={
                            <FormattedMessage id="modal-view-trespass.headline-exclusion-based-on" />
                          }
                          listStyle="bullets"
                          items={cust.trespass.exclusionOrTrespassBasedOn}
                          itemFormatter={itemsFormatterExclusionList}
                          isEmptyMessage="-"
                        />
                      </Col>
                    </Row>
                    </>)
                  : null}

                  {/* DECLARATION OF SERVICE DETAILS */}
                  <Row style={{ marginTop: '15px' }}>
                      <Col xs={4}>
                      <Headline size="medium" tag="h2">
                          {isDeclarationOfService ? (<FormattedMessage id="details-pane.customersForRender-declaration-of-service" />) : !isTrespassed ? null : (<FormattedMessage id="details-pane.customersForRender-no-declaration-of-service" />) }
                        </Headline>
                      </Col>
                    </Row>

                    {isDeclarationOfService ? <Row style={{ marginTop: '15px', marginBottom: '30px'}}>
                      <Col xs={2}>
                        <Headline size="medium" tag="h3">
                          <FormattedMessage id="modal-view-trespass.headline-date-served" />
                        </Headline>
                        <p>
                          {cust.trespass.declarationOfService
                            ? convertDateIgnoringTZ(cust.trespass.declarationOfService.date) : '-'}
                        </p>
                      </Col>
                      <Col xs={2}>
                        <Headline size="medium" tag="h3">
                          <FormattedMessage id="modal-view-trespass.headline-place-signed" />
                        </Headline>
                        <p>
                          {cust.trespass.declarationOfService
                            ? associatedKeyPlaceSigned(cust.trespass.declarationOfService.placeSigned)
                            : '-'}
                        </p>
                      </Col>
                      <Col xs={2}>
                        <Headline size="medium" tag="h3">
                          <FormattedMessage id="modal-view-trespass.headline-title" />
                        </Headline>
                        <p>
                          {cust.trespass.declarationOfService
                            ? cust.trespass.declarationOfService.title
                            : '-'}
                        </p>
                      </Col>
                      <Col xs={2}>
                        <Headline size="medium" tag="h3">
                          <FormattedMessage id="modal-view-trespass.headline-signed" />
                        </Headline>
                        <p>
                          {cust.trespass.declarationOfService && cust.trespass.declarationOfService.signature ? (<FormattedMessage id="details-pane.customersForRender-declaration-of-service-signature-yes"/>) : '-'}
                        </p>
                      </Col>
                    </Row> : null
                    }
                  </Accordion>);
                  })}
              </Col>
              </Row>
            </div>
          </Accordion>


          <Accordion label={<FormattedMessage id="details-pane.accordion-label.incident-details"/>}>
                <Row>
                  <Col xs={3}>
                    <Label
                      style={{ marginTop: '5px' }}
                      size="medium"
                      tag="h2"
                      id="incident-location-label"
                    >
                      <FormattedMessage id="details-pane.incident-location" />
                    </Label>
                    <Col>
                      <p aria-labelledby="incident-location-label">
                        {locName}
                      </p>
                    </Col>
                  </Col>

                  {subLocation !== '' ? (
                    <Col xs={3}>
                      <Label
                        style={{ marginTop: '5px' }}
                        size="medium"
                        tag="h2"
                        id="incident-sub-location-label"
                      >
                        <FormattedMessage id="details-pane.sub-location" />
                      </Label>
                      <Col>
                        <p aria-labelledby="incident-sub-location-label">
                          {subLocation}
                        </p>
                      </Col>
                    </Col>
                  ) : null}
                </Row>

                <Row>
                  <Col xs={3}>
                    <Label
                      style={{ marginTop: '5px' }}
                      size="medium"
                      tag="h2"
                      id="date-of-incident-label"
                    >
                      <FormattedMessage id="details-pane.date-of-incident" />
                    </Label>
                    <Col>
                      <p aria-labelledby="date-of-incident-label">
                        {convertUTCISOToPrettyDate(dateTimeOfIncident) || (<FormattedMessage id="not-available"/>)}
                      </p>
                    </Col>
                  </Col>

                  <Col xs={3}>
                    <Label
                      style={{ marginTop: '5px' }}
                      size="medium"
                      tag="h2"
                      id="time-of-incident-label"
                    >
                      <FormattedMessage id="details-pane.time-of-incident" />
                    </Label>
                    <Col>
                      <p aria-labelledby="time-of-incident-label">
                        {isApproximateTime ? 
                          (<>
                          <FormattedMessage id="isApproximateTime" defaultMessage="Approximately" /> {convertUTCISOToLocalePrettyTime(dateTimeOfIncident)}</>
                          )
                          : 
                          (convertUTCISOToLocalePrettyTime(dateTimeOfIncident))
                      }
                      </p>
                    </Col>
                  </Col>
                </Row>

                <Row style={{ marginTop: '25px' }}>
                  <Col xs={6}>
                    <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                      <FormattedMessage
                        id="witnesses-list-label"
                        values={{
                          count: witnessNames.length,
                          bold: (chunks) => <strong>{chunks}</strong>,
                        }}
                      />
                    </Label>
                    <List
                      aria-labelledby="witnesses-list-label"
                      label={witnessesListLabel}
                      listStyle="bullets"
                      items={witnessesForRender}
                      itemFormatter={witnessItemFormatter}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: '25px' }}>
                  <Col xs={2}>
                    <KeyValue 
                      label={linkedToSummary.length > 0 ? <FormattedMessage id="linked-incidents-label"/> : <FormattedMessage id="linked-incidents-empty-label"/>}
                      value={linkedToSummary.length > 0 ? (
                        <div style={{ display: 'grid', rowGap: '10px' }}>
                          {linkedToSummary.map((ltS) => (
                            <LinkedIncident 
                              key={ltS.id}
                              summaryObj={ltS}
                              renderContext='details'
                            />
                          ))}
                        </div>
                      ) : null
                      }
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: '13px' }}>
                  <Col xs={8}>
                    <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                      {incidentTypesListLabel}
                    </Label>
                    <List
                      listStyle="bullets"
                      label={incidentTypesListLabel}
                      items={incTypeTitles} 
                      itemFormatter={incTypeFormatter}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col xs={6}>
                    <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                      <FormattedMessage id="details-pane.incident-description" />
                    </Label>
                    <Col>
                      <div 
                        dangerouslySetInnerHTML={createMarkup(detailedDescriptionOfIncident)}>
                      </div>
                    </Col>
                  </Col>
                </Row>

                <Row style={{ marginTop: '15px' }}>
                  <Col xs={6}>
                    <Label
                      style={{ marginTop: '5px' }}
                      size="medium"
                      tag="h2"
                      id="created-by-label"
                    >
                      <FormattedMessage id="details-pane.created-by" />
                    </Label>
                    {readyCreatedByInUI}
                  </Col>
                </Row>
            </Accordion>

            <Accordion
              label={<FormattedMessage id="accordion-label-documents" />}
            >
              {/* This div does not render visible UI. Maps documents for GetMedia connected component */}
              <div>
                {documents?.map((doc) => (
                  <GetMedia 
                    context='document'
                    key={doc.id}
                    id={id}
                    imageId={doc.id}
                    mediaHandler={(mediaUrl) => handleMediaUrl(mediaUrl, doc.id)}
                  />
                ))}
              </div>

              {/* This sorts and maps document buttons. The most recent documents are placed at the visual top of list with a clock icon to identify the most current trespass document(s). */}
             <div>
                {sortedDocuments.map((doc) => {
                  const isMostCurrent = mostCurrentTrespassDocIds.includes(doc.id);

                  return (
                    <Row xs={2} style={{ marginLeft: '15px' }} key={doc.id}>
                      <Button
                        allowAnchorClick={true}
                        href={mediaSrc[doc.id]}
                        target='_blank'
                        style={{ marginTop: '15px' }}
                      >
                        {doc.description}
                      </Button>
                      {isMostCurrent && (
                        <span style={{ marginLeft: '8px', marginTop: '20px' }}>
                          <Icon icon='clock' size='small' />
                        </span>
                      )}
                    </Row>
                  );
                })}
              </div>
            </Accordion>
          </AccordionSet>
        </Pane>
      )}
    </>
  );
};

export default DetailsPane;