import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  AccordionSet,
  Accordion,
  Button,
  Col,
  Dropdown,
  DropdownMenu,
  Headline,
  KeyValue,
  Label,
  Pane,
  PaneMenu,
  Row,
} from '@folio/stripes/components';
import GetTrespassReasons from './GetTrespassReasons';
import { useIncidents } from '../contexts/IncidentContext';
import PutTrespassReasons from './PutTrespassReasons';
import ModalDeleteTrespassReason from './ModalDeleteTrespassReason';

const TrespassReasonDetailsPane = ({handleShowEdit, handleCloseDetails, ...props}, ) => {
  const { id } = useParams();
  const { 
    trespassReasons
  } = useIncidents();

  const [isClickDelete, setIsClickDelete] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [formattedData, setFormattedData] = useState(null);
  const [viewTrespassReason, setViewTrespassReason] = useState({
    reason: '',
    isDefault: false,
    isSuppressed: false
  });

  useEffect(() => {
    const singleTRbyId = trespassReasons.find(tr => tr.id === id);
    // console.log("singleTRbyId --> ", JSON.stringify(singleTRbyId, null, 2))
    if (singleTRbyId) {
      setViewTrespassReason(singleTRbyId)
    } 
  }, [id, trespassReasons])

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
      const updatedTrespassReasons = trespassReasons.filter((tr) => {
        return tr.id !== toDeleteId;
      });
      const readyFormattedData = {
        data: {
          value: {
            trespassReasons: updatedTrespassReasons
          }
        }
      }
      setFormattedData(readyFormattedData);
    }
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
            style={{ marginTop: '10px' }}
            buttonStyle="primary"
            onClick={() => handleShowEdit(id)}
          >
          <FormattedMessage id="edit-button" />
          </Button>
            <Button
            style={{ marginTop: '10px' }}
            buttonStyle="warning"
            onClick={() => handleShowModal(id)}
          >
          <FormattedMessage id="settings.incident-types.details-delete-button" />
          </Button>
        </DropdownMenu>
      </Dropdown>
    </PaneMenu>
  );

  return (
    <Pane
      dismissible
      onClose={handleCloseDetails}
      defaultWidth="100%"
      paneTitle={<FormattedMessage id="settings.trespass-reason-paneTitle"/>}
      {...props}
      lastMenu={lastMenu}>

      <GetTrespassReasons />

      {isClickDelete && (
        <ModalDeleteTrespassReason 
          isOpen={isClickDelete}
          onClose={handleCloseModal}
          onConfirm={handleDelete}
        />
      )}

      {formattedData && (
        <PutTrespassReasons 
          data={formattedData}
          context='delete'
          handleDeleteSuccess={handleDeleteSuccess}
        />
      )}

      <AccordionSet>
        <Accordion label='Details'>
         <Row>
          <Col xs={6}>
            <KeyValue
              label={<FormattedMessage id="settings.trespass-reason-details-reason-label"/>}
              value={viewTrespassReason.reason || ''}
            />
          </Col>
         </Row>

        <Row>
          <Col xs={6}>
            <KeyValue
              label={<FormattedMessage id="settings.trespass-reason-details-default-label"/>}
              value={viewTrespassReason.isDefault ? 
                (<FormattedMessage id="settings.trespass-reason-details-yes"/>) 
                : (<FormattedMessage id="settings.trespass-reason-details-no"/>)
              }
            />
          </Col>
         </Row>

        <Row>
          <Col xs={6}>
            <KeyValue
              label={ <FormattedMessage id="settings.trespass-reason-details-isSuppressed-label"/>}
              value={viewTrespassReason.isSuppressed ? 
                (<FormattedMessage id="settings.trespass-reason-details-yes"/>) 
                : (<FormattedMessage id="settings.trespass-reason-details-no"/>)
              }
            />
          </Col>
         </Row>
        </Accordion>
      </AccordionSet>
    </Pane>
  );
};

export default TrespassReasonDetailsPane; 