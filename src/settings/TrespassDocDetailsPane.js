import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { FormattedMessage } from 'react-intl';
import { useParams, useHistory } from 'react-router-dom';
import {
  AccordionSet,
  Accordion,
  Button,
  Col,
  Headline,
  Label,
  Pane,
  PaneMenu,
  Row,
} from '@folio/stripes/components';
import GetTrespassTemplates from './GetTrespassTemplates';
import { useIncidents } from '../contexts/IncidentContext';
import ModalPreviewTrespassDoc from './ModalPreviewTrespassDoc';
import DOMPurify from 'dompurify';
import { tokenValues } from './data/templateTokens';

const TrespassDocDetailsPane = ({handleShowEdit, ...props}, ) => {
  const { id } = useParams();
  const history = useHistory();
  const { 
    trespassTemplates
  } = useIncidents();

  const [viewTemplateData, setViewTemplateData] = useState({
    name: '',
    active: Boolean,
    isDefault: Boolean,
    description: '',
    templateValue: ''
  });
  const [previewContent, setPreviewContent] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const processContentForView = (template) => {
    let processedContent = template;
    Object.keys(tokenValues).forEach((token) => {
      const value = tokenValues[token];
      // replace special chars as escaped
      const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      // replace regex with matched value
      processedContent = processedContent.replace(regex, value);
    })
    return processedContent;
  };

  useEffect(() => {
    if (trespassTemplates && trespassTemplates.length > 0) {
      const foundTemplate = trespassTemplates.find((template) => template.id === id);
      if (foundTemplate) {
        const readyPreviewContent = processContentForView(foundTemplate.templateValue);
        setPreviewContent(readyPreviewContent);
        setViewTemplateData({
          name: foundTemplate.name || '', 
          active: foundTemplate.active || false,
          isDefault: foundTemplate.isDefault || false,
          description: foundTemplate.description || '', // not required
          templateValue: foundTemplate.templateValue || ''
        });

      } else {
        console.log(`template with id ${id} not found`);
        setViewTemplateData({
          name: '',
          active: '',
          description: '',
          templateValue: ''
        });
        setPreviewContent('');
      };
    };
  }, [trespassTemplates, id]);

  const handlePreviewClick = () => {
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
  };

  const handleCloseDismiss = () => {
    history.push(`/settings/incidents/trespass-template`);
  };

  const lastMenu = (
    <PaneMenu>
      <Button
        style={{ marginTop: '10px' }}
        buttonStyle="primary"
        onClick={() => handleShowEdit(id)}
      >
      <FormattedMessage id="edit-button" />
      </Button>
    </PaneMenu>
  );

  return (
    <Pane
      dismissible
      onClose={handleCloseDismiss}
      defaultWidth="100%"
      paneTitle={viewTemplateData.name}
      {...props}
      lastMenu={lastMenu}>

      <GetTrespassTemplates />

      {showPreviewModal && previewContent &&
        <ModalPreviewTrespassDoc 
          previewContent={previewContent}
          closePreviewModal={closePreviewModal}
        />}

      <AccordionSet>
        <Accordion label='Details'>
         <Row>
          <Col xs={6}>
            <Label>
              <FormattedMessage id="settings.trespass-document-name-label"/>
            </Label>
            <Headline 
              tag='p'
              size='medium'
              margin='medium'
            >
              {viewTemplateData.name || ''}
            </Headline>
          </Col>
         </Row>

        <Row>
          <Col xs={6}>
            <Label>
              <FormattedMessage id="settings.trespass-document-active-label"/>
            </Label>
            <Headline 
              tag='p'
              size='medium'
              margin='medium'
            >
            {viewTemplateData.active ? 'Yes' : 'No'}
            </Headline>
          </Col>
         </Row>

            <Row>
          <Col xs={6}>
            <Label>
              <FormattedMessage id="settings.trespass-document-default-label"/>
            </Label>
            <Headline 
              tag='p'
              size='medium'
              margin='medium'
            >
            {viewTemplateData.isDefault ? (<FormattedMessage 
              id="settings.trespass-document-isDefault-yes"/>) : (<FormattedMessage 
              id="settings.trespass-document-isDefault-no"/>)}
            </Headline>
          </Col>
         </Row>


        <Row>
          <Col xs={6}>
            <Label>
              <FormattedMessage id="settings.trespass-document-description-label"/>
            </Label>
            <Headline 
              tag='p'
              size='medium'
              margin='medium'
            >
            {viewTemplateData.description ? 
            viewTemplateData.description 
            : (<FormattedMessage 
              id="settings.trespass-document-default-no-description"/>)
            }
            </Headline>
          </Col>
         </Row>
        </Accordion>

        <Accordion label='Document'>
          <Row style={{ marginTop: '20px'}}>
            <Col xs={6}>
            <Button
              onClick={handlePreviewClick}
            >
              <FormattedMessage 
                id="settings.trespass-document-preview-button"
                />
            </Button>
            </Col>
          </Row>

          <div
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(previewContent)
            }}
          >
          </div>
        </Accordion>
      </AccordionSet>
    </Pane>
  );
};

export default TrespassDocDetailsPane; 