import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  AccordionSet,
  Accordion,
  Button,
  Col,
  Dropdown,
  DropdownMenu,
  Label,
  Pane,
  PaneHeader,
  PaneMenu,
  Row,
} from '@folio/stripes/components';
import GetIncidentCategories from './GetIncidentCategories';
import GetSingleIncidentTypeDetails from './GetSingleIncidentTypeDetails';
import ModalDeleteIncidentType from './ModalDeleteIncidentType';
import GetIncidentTypesDetails from './GetIncidentTypesDetails';
import PutIncidentType from './PutIncidentType';
import getCategoryTitleById from './helpers/getCategoryTitleById';
import { useIncidents } from '../contexts/IncidentContext';

const IncidentTypeDetailsPane = ({
  handleCloseDetails,
  handleShowEdit,
  ...props
}) => {
  const { incidentCategories } = useIncidents();
  const { id } = useParams();
  const [detailsData, setDetailsData] = useState(null);
  const [allIncidentTypes, setAllIncidentTypes] = useState([]);
  const [isClickDelete, setIsClickDelete] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [formattedData, setFormattedData] = useState(null);

  const handleFetchedDetails = (data) => {
    setDetailsData(data);
  };

  const handleIncidentTypes = (data) => {
    setAllIncidentTypes(data);
  };

  const handleShowModal = (incidentTypeId) => {
    setIsClickDelete(true);
    setToDeleteId(incidentTypeId);
  };

  const handleCloseModal = () => {
    setIsClickDelete(false);
    setToDeleteId(null);
  };

  const handleDeleteSuccess = () => {
    handleCloseModal();
    handleCloseDetails();
  };

  const handleDelete = () => {
    if (toDeleteId) {
      const updatedIncidentTypes = allIncidentTypes.filter((type) => {
        return type.id !== toDeleteId;
      });
      const readyFormattedData = {
        data: {
          value: {
            incidentTypes: updatedIncidentTypes
          }
        }
      }
      setFormattedData(readyFormattedData);
    }
  };

  const { category_id, title, description } = detailsData || {};


  const categoryTitle = React.useMemo(
    () => getCategoryTitleById(incidentCategories, category_id),
    [incidentCategories, category_id]
  );
  



  const style = {
    display: 'block',
    width: '50%',
    marginTop: '10px',
  };

  const lastMenu = (
    <PaneMenu>
      <Dropdown
        label={<FormattedMessage id="dropdown-actions-button" />}
        buttonProps={{ buttonStyle: 'primary' }}
        style={{ marginTop: '8px' }}
      >
        <DropdownMenu>
          <Button
            buttonStyle="primary"
            style={style}
            onClick={() => handleShowEdit(id)}
          >
            <FormattedMessage id="edit-button" />
          </Button>
          <Button
            buttonStyle="warning"
            style={style}
            onClick={() => handleShowModal(id)}
          >
            <FormattedMessage id="settings.incident-types.details-delete-button" />
          </Button>
        </DropdownMenu>
      </Dropdown>
    </PaneMenu>
  );

  const renderHeader = (renderProps) => (
    <PaneHeader
      {...renderProps}
      dismissible
      onClose={handleCloseDetails}
      paneTitle={
        <FormattedMessage id="settings.incident-types.details.paneTitle" />
      }
      lastMenu={lastMenu}
    />
  );

  return (
    <Pane
      defaultWidth="70%"
      paneTitle={
        <FormattedMessage id="settings.incident-types.details.paneTitle" />
      }
      renderHeader={renderHeader}
    >
      <GetIncidentCategories />
      <GetSingleIncidentTypeDetails
        key={id}
        detailsId={id}
        handleFetchedDetails={handleFetchedDetails}
      />
      <GetIncidentTypesDetails
        context="settings"
        handleIncidentTypes={handleIncidentTypes}
      />
      {formattedData && (
        <PutIncidentType
          data={formattedData}
          context="details"
          handleDeleteSuccess={handleDeleteSuccess}
        />
      )}
      {isClickDelete && (
        <ModalDeleteIncidentType
          isOpen={isClickDelete}
          onClose={handleCloseModal}
          onConfirm={handleDelete}
        />
      )}

      <AccordionSet>
        <Accordion
          label={
            <FormattedMessage id="settings.incident-types.details.accordion-general-info-label" />
          }
        >
          <Row>
            <Col xs={8}>
              <Col>
                <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                  <FormattedMessage id="settings.incident-types.details.title-label" />
                </Label>
                <p>{title}</p>
              </Col>
            </Col>
          </Row>
          <Row>
            <Col xs={8}>
              <Col>
                <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                  <FormattedMessage id="settings.incident-types.details.category-label" />
                </Label>
                <p>{getCategoryTitleById(incidentCategories, category_id)}</p>
              </Col>
            </Col>
          </Row>
          <Row>
            <Col xs={10}>
              <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                <FormattedMessage id="settings.incident-types.details.description-label" />
              </Label>
              <p>{description}</p>
            </Col>
          </Row>
        </Accordion>
        <Accordion
          label={<FormattedMessage id="settings.additional-accordion-label" />}
        />
      </AccordionSet>
    </Pane>
  );
};

IncidentTypeDetailsPane.propTypes = {
  handleCloseDetails: PropTypes.func.isRequired,
  handleShowEdit: PropTypes.func.isRequired,
};

export default IncidentTypeDetailsPane;