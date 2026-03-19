
import React, { createContext, useState, useContext, useEffect } from 'react';
// export for class components
export const IncidentContext = createContext(); 
// export for function components
export const useIncidents =  () => useContext(IncidentContext); 

export const IncidentProvider = ({ children }) => {
  // data
  const [incidentsList, setIncidentsList] = useState([]);
  const [singleIncident, setSingleIncident] = useState({});
  const [incidentTypesList, setIncidentTypesList] = useState([])
  const [incidentTypesNamesIdsList, setIncidentTypesNamesIdsList] = useState([]); 
  const [locations, setLocations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [self, setSelf] = useState({})
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedWitnesses, setSelectedWitnesses] = useState([]);
  const [selectedTrespassWitnesses, setSelectedTrespassWitnesses] = useState([]);
  const [describedCustomers, setDescribedCustomers] = useState([]);
  const [attachmentsData, setAttachmentsData] = useState([]); 
  const [idForMediaCreate, setIdForMediaCreate] = useState(null);
  const [formDataArrayForMediaCreate, setFormDataArrayForMediaCreate] = useState(null);
  const [modalErrorContent, setModalErrorContent] = useState("");
  const [locationsInService, setLocationsInService] = useState([]);
  const [incidentCategories, setIncidentCategories] = useState([]);
  const [trespassTemplates, setTrespassTemplates] = useState([]);
  const [trespassReasons, setTrespassReasons] = useState([]);
  const [organizationTimezone, setOrganizationTimezone] = useState('');

  // toggle
  const [isDetailsPaneOpen, setIsDetailsPaneOpen] = useState(false);
  const [isEditPaneOpen, setIsEditPaneOpen] = useState(false);
  const [isCreatePaneOpen, setIsCreatePaneOpen] = useState(false);
  const [isModalSelectTypesOpen, setIsModalSelectTypesOpen] = useState(false);
  const [isModalUnknownCustOpen, setIsModalUnknownCustOpen] = useState(false);
  const [isModalSelectKnownCustOpen, setIsModalSelectKnownCustOpen] = useState(false);
  const [isModalSelectWitness, setIsModalSelectWitness] = useState(false);
  const [isModalDeleteDescCustOpen, setIsModalDeleteDescCustOpen] = useState(false);
  const [isModalCustomerDetails, setIsModalCustomerDetails] = useState(false);
  const [isModalViewCustomerDetails, setIsModalViewCustomerDetails] = useState(false);
  const [isModalTrespass, setIsModalTrespass] = useState(false);
  const [isModalViewTrespass, setIsModalViewTrespass] = useState(false);
  const [isModalMedia, setIsModalMedia] = useState(false);
  const [isModalViewImage, setIsModalViewImage] = useState(false);
  const [isModalViewDocument, setIsModalViewDocument] = useState(false);
  const [isModalCustomWitness, setIsModalCustomWitness] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showModalError, setShowModalError] = useState(false);
  const [isImageArrayLoading, setIsImageArrayLoading] = useState(false);
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);

 // nav
 const [mode, setMode] = useState('');
 const [recentInstanceId, setRecentInstanceId] = useState('');

 // query
 const [limit, setLimit] = useState(20); //limit value for query params, pagination
 const [offset, setOffset] = useState(0);//offset value for query params, pagination
 const [totalResults, setTotalResults] = useState(0);//value of response total records
 const [appliedSearchParams, setAppliedSearchParams] = useState(null); // stable, cleaned fields for local persist
 const [queryString, setQueryString] = useState("");// value passed to <GetListByDynamicQuery/>


 //  TODO remove useGetList
 const [useGetList, setUseGetList] = useState(false);//boolean to run <GetListByDynamicQuery/>


//  useEffect(() => {
//   console.log("@IncidentContext - offset --> ", offset)
//  }, [offset]);

  // document error
  const [documentError, setDocumentError] = useState(false);
  const [documentErrorMessage, setDocumentErrorMessage] = useState([]);

  const triggerDocumentError = (message) => {
    setDocumentError(true);
    setDocumentErrorMessage((prev) => [...prev, message])
  };

  const clearDocumentError = () => {
    setDocumentError(false);
    setDocumentErrorMessage([]);
  };

  const updateSingleIncident = (incident) => {
    setSingleIncident(incident);
  };

  const openDetailsPane = () => {
    setIsDetailsPaneOpen(true);
  };

  const closeDetailsPane = () => {
    setIsDetailsPaneOpen(false);
  };

  const openEditPane = () => {
    setIsEditPaneOpen(true)
  };

  const closeEditPane = () => {
    setIsEditPaneOpen(false)
  };

  const openCreatePane = () => {
    setIsCreatePaneOpen(true)
  };

  const closeCreatePane = () => {
    setIsCreatePaneOpen(false)
  };

  const openModalSelectTypes = () => {
    setIsModalSelectTypesOpen(true)
  };

  const closeModalSelectTypes = () => {
    setIsModalSelectTypesOpen(false)
  };

  const openModalUnknownCust = () => {
    setIsModalUnknownCustOpen(true)
  };

  const closeModalUnknownCust = () => {
    setIsModalUnknownCustOpen(false)
  };

  const openModalSelectKnownCust = () => {
    setIsModalSelectKnownCustOpen(true)
  };

  const closeModalSelectKnownCust = () => {
    setIsModalSelectKnownCustOpen(false)
  };

  const openModalSelectWitness = () => {
    setIsModalSelectWitness(true)
  };

  const closeModalSelectWitness = () => {
    setIsModalSelectWitness(false)
  };

  const openModalDeleteDescCustOpen = () => {
    setIsModalDeleteDescCustOpen(true)
  };

  const closeModalDeleteDescCustOpen = () => {
    setIsModalDeleteDescCustOpen(false)
  };

  const openModalCustomerDetails = () => {
    setIsModalCustomerDetails(true)
  };

  const closeModalCustomerDetails = () => {
    setIsModalCustomerDetails(false)
  };

  const openModalViewCustomerDetails = () => {
    setIsModalViewCustomerDetails(true)
  };

  const closeModalViewCustomerDetails = () => {
    setIsModalViewCustomerDetails(false)
  };

  const openModalTrespass = () => {
    setIsModalTrespass(true)
  };

  const closeModalTrespass = () => {
    setIsModalTrespass(false)
  };

  const openModalMedia = () => {
    setIsModalMedia(true)
  };

  const closeModalMedia = () => {
    setIsModalMedia(false)
  };

  const openModalViewImage = () => {
    setIsModalViewImage(true)
  };

  const closeModalViewImage = () => {
    setIsModalViewImage(false)
  };

  const openModelViewDocument = () => {
    setIsModalViewDocument(true)
  };

  const closeModalViewDocument = () => {
    setIsModalViewDocument(false)
  };

  
  const openModalCustomWitness= () => {
    setIsModalCustomWitness(true)
  };

  const closeModalCustomWitness = () => {
    setIsModalCustomWitness(false)
  };

  const openModelViewTrespass = () => {
    setIsModalViewTrespass(true)
  };

  const closeModalViewTrespass = () => {
    setIsModalViewTrespass(false)
  };

  const openModalError = () => {
    setShowModalError(true)
  };

  const closeModalError = () => {
    setShowModalError(false)
  };

  const openImageSkeleton = () => {
    setIsImageArrayLoading(true)
  };

  const closeImageSkeleton = () => {
    setIsImageArrayLoading(false)
  };

  const openLoadingSearch = () => {
    setIsLoadingSearch(true)
  };

  const closeLoadingSearch = () => {
    setIsLoadingSearch(false)
  };

  const openLoadingDetails = () => {
    setIsLoadingDetails(true)
  };

  const closeLoadingDetails = () => {
    setIsLoadingDetails(false)
  };

  return (
    <IncidentContext.Provider value={{
      // data
      incidentsList,
      setIncidentsList,

      singleIncident,
      setSingleIncident,

      incidentTypesList,
      setIncidentTypesList,

      incidentTypesNamesIdsList, 
      setIncidentTypesNamesIdsList,

      locations, 
      setLocations,

      customers, 
      setCustomers,

      self,
      setSelf,

      selectedCustomers,
      setSelectedCustomers,

      selectedWitnesses, 
      setSelectedWitnesses,

      selectedTrespassWitnesses, 
      setSelectedTrespassWitnesses,

      describedCustomers, 
      setDescribedCustomers,

      attachmentsData, 
      setAttachmentsData,

      idForMediaCreate, 
      setIdForMediaCreate,

      formDataArrayForMediaCreate, 
      setFormDataArrayForMediaCreate,

      modalErrorContent, 
      setModalErrorContent,

      locationsInService, 
      setLocationsInService,

      incidentCategories, 
      setIncidentCategories,

      trespassTemplates, 
      setTrespassTemplates,

      trespassReasons, 
      setTrespassReasons,

      organizationTimezone, 
      setOrganizationTimezone,

      // togglers
      isDetailsPaneOpen,
      openDetailsPane,
      closeDetailsPane,

      isEditPaneOpen,
      openEditPane,
      closeEditPane,

      isCreatePaneOpen,
      openCreatePane,
      closeCreatePane,

      isModalSelectTypesOpen,
      openModalSelectTypes,
      closeModalSelectTypes,

      isModalUnknownCustOpen,
      openModalUnknownCust,
      closeModalUnknownCust,

      isModalSelectKnownCustOpen,
      openModalSelectKnownCust,
      closeModalSelectKnownCust,

      isModalSelectWitness,
      openModalSelectWitness,
      closeModalSelectWitness,

      isModalDeleteDescCustOpen,
      openModalDeleteDescCustOpen,
      closeModalDeleteDescCustOpen,

      isModalTrespass,
      openModalTrespass,
      closeModalTrespass,

      isModalViewTrespass, 
      openModelViewTrespass, 
      closeModalViewTrespass,

      isModalCustomerDetails, 
      openModalCustomerDetails, 
      closeModalCustomerDetails,

      isModalViewCustomerDetails, 
      openModalViewCustomerDetails, 
      closeModalViewCustomerDetails,

      isModalMedia,
      openModalMedia,
      closeModalMedia,
      
      isModalViewImage, 
      openModalViewImage,
      closeModalViewImage,

      isModalViewDocument, 
      openModelViewDocument, 
      closeModalViewDocument,

      isModalCustomWitness, 
      openModalCustomWitness, 
      closeModalCustomWitness,

      showModalError,
      openModalError,
      closeModalError,

      isImageArrayLoading, 
      openImageSkeleton, 
      closeImageSkeleton,

      isUpdatingReport, 
      setIsUpdatingReport,

      isCreatingReport, 
      setIsCreatingReport,


      isLoadingSearch,
      openLoadingSearch,
      closeLoadingSearch,

      isLoadingDetails,
      setIsLoadingDetails,
      openLoadingDetails,
      closeLoadingDetails,

      useGetList, 
      setUseGetList,

      // nav
      mode, 
      setMode,

      queryString, 
      setQueryString,

      limit, setLimit, 
      offset, setOffset, 
      totalResults, setTotalResults,
      appliedSearchParams, setAppliedSearchParams,

      // document error
      documentError, setDocumentError, 
      documentErrorMessage, setDocumentErrorMessage,
      triggerDocumentError, 
      clearDocumentError,

      recentInstanceId, 
      setRecentInstanceId
    }}>
      {children}
    </IncidentContext.Provider>
  )
};