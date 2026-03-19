
import React, { useState, useRef, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import DOMPurify from 'dompurify';
import { useHistory, Switch, Route } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Col,
  Editor,
  Icon,
  MessageBanner,
  MultiColumnList,
  Pane,
  Paneset,
  Row,
  TextField
} from '@folio/stripes/components';
import GetTrespassTemplates from './GetTrespassTemplates';
import PutTrespassTemplate from './PutTrespassTemplate';
import ModalTrespassDocTokens from './ModalTrespassDocTokens';
import ModalPreviewTrespassDoc from './ModalPreviewTrespassDoc';
import TrespassDocDetailsPane from './TrespassDocDetailsPane';
import TrespassDocEditPane from './TrespassDocEditPane';
import stripHTML from '../components/incidents/helpers/stripHTML';
import makeId from './helpers/makeId';
import { tokensArray, tokenValues } from './data/templateTokens';
import { useIncidents } from '../contexts/IncidentContext';


const TrespassDocPaneset = ({...props}) => {
  const history = useHistory();
  const { 
    trespassTemplates
  } = useIncidents();

  const [showTokensModal, setShowTokensModal] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [lastRange, setLastRange] = useState(null);
  const [formattedConfigTemplates, setFormattedConfigTemplates] = useState(''); 
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    active: false,
    isDefault: false,
    description: '',
    templateValue: ''
  })

  const editorRef = useRef(null);

  // save current quill current selection
  const saveCurrentSelection = () => {
    const quill = editorRef.current?.getEditor?.();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        setLastRange(range)
      }
    }
  };

  const handleInsertClick = () => {
    saveCurrentSelection();
    setShowTokensModal(true)
  };

  const handleInsertTokens = () => {
    setShowTokensModal(false);
    setTimeout(() => {
      const quill = editorRef.current?.getEditor?.();
      if (quill) {
        quill.focus();
        if (lastRange) {
          quill.setSelection(lastRange);
          const tokensText = selectedTokens.join(' ');
          quill.insertText(lastRange.index, tokensText);
          quill.setSelection(lastRange.index + tokensText.length)
        } else {
          const tokensText = selectedTokens.join(' ');
          quill.insertText(quill.getLength(), tokensText);
          quill.setSelection(quill.getLength());
        }
      }
    }, 0)
    // clear selected tokens for next use
    setSelectedTokens([])
  };


  const getProcessedContentFromEditor = () => {
    const quill = editorRef.current?.getEditor?.();
    if (quill) {
      console.log("quill version: ", quill.version)
      const contentHtml = quill.root.innerHTML;
      // const delta = quill.getContents();

      let processedContent = contentHtml;
      console.log("processedContent init as = contentHTML: ", processedContent)
      // let processedContent = delta;

      Object.keys(tokenValues).forEach((token) => {
        const value = tokenValues[token];
        // replace special chars as escaped
        const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        // replace regex with matched value
        processedContent = processedContent.replace(regex, value);
      })
      console.log("processedContent, replaced: ", processedContent)
      return processedContent;
    } else {
      console.error('quill instance not available')
      return null;
    }
  };

  const getContentHTMLForSave = () => {
    const quill = editorRef.current?.getEditor?.();
    if (quill) {
      const contentHtml = quill.root.innerHTML;
      return contentHtml
    }
  };

  const handlePreviewClick = () => {
    setShowPreviewModal(true);
    saveCurrentSelection();
    setPreviewContent(getProcessedContentFromEditor());
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setTimeout(() => {
      const quill = editorRef.current?.getEditor?.();
      if (quill) {
        quill.focus();
        if (lastRange) {
          // set to last range
          quill.setSelection(lastRange);
        } else {
          // else the length of Editor
          quill.setSelection(quill.getLength());
        }
      }
    }, 0)
  };

  useEffect(() => {
    const quill = editorRef.current?.getEditor?.();
    if (quill) {
      const handler = (range, oldRange, source) => {
        console.log('selection-change:', { range, oldRange, source });
        if (range) {
          setLastRange(range)
        };
        // no update if lastRange is null
      };

      quill.on('selection-change', handler);

      // clean up on unmount or when quill changes
      return () => {
        quill.off('selection-change', handler)
      };
    }
  }, [editorRef.current]);

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'active') {
      setFormData((prev) => ({
        ...prev,
        [name]: event.target.checked
      }));
    } else if (name === 'isDefault') {
      setFormData((prev) => ({
        ...prev,
        [name]: event.target.checked
      }));
    }  else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    };
  };

  const makeTrespassTemplateObj = (contentHTML) => {
    const sanitizedContent = DOMPurify.sanitize(contentHTML);
    return {
      id: makeId(formData.name),
      name: formData.name.trim(),
      active: formData.isDefault ? true : formData.active, 
      isDefault: formData.isDefault,
      description: formData.description.trim(),
      templateValue: sanitizedContent
    }
  };

  const resetForFreshTemplateInput = () => {
    setPreviewContent('');
    setFormData({
      id: '',
      name: '',
      active: false,
      description: '',
      templateValue: ''
    });
    const quill = editorRef.current?.getEditor?.();
    if (quill) {
      quill.setText('');
      quill.setContents([]);
      quill.history.clear(); // clear undo stack
      quill.setSelection(0); // cursor to first index
    } else {
      console.error('Quill instance not available');
    };
    setLastRange(null);
  };

  const handleSaveTemplate = () => {
    const readyContentHTML = getContentHTMLForSave(); 
    const newTemplate = makeTrespassTemplateObj(readyContentHTML); 
    const isDuplicate = trespassTemplates.some((template) => template.id === newTemplate.id);
    if (!isDuplicate) {
      let updatedTrespassTemplates = [];
      if (newTemplate.isDefault) {
        const removedPrevDefaultList = trespassTemplates.map((template) => {
          // ensure if newTemplate.isDefault === true that it is the only default template
          return { ...template, isDefault: false }
        });
        updatedTrespassTemplates = [...removedPrevDefaultList, newTemplate];
      } else {
        updatedTrespassTemplates = [...trespassTemplates, newTemplate]
      };

      const readyFormattedData = {
        value: {
          templates: updatedTrespassTemplates
        }
      };
      setFormattedConfigTemplates({ data: readyFormattedData });
      resetForFreshTemplateInput();
    } else {
      resetForFreshTemplateInput();
    };
  };

  const handleShowDetails = (event, row) => {
    const id = row.id
    history.push(`/settings/incidents/trespass-template/${id}`);
  };

  const handleShowEdit = (templateId) => {
    history.push(`/settings/incidents/trespass-template/${templateId}/edit`);
  };

  const handleCancelEdit = (templateId) => {
    history.push(`/settings/incidents/trespass-template/${templateId}`);
  };

  const handleCloseEdit = (templateId) => {
    history.push(`/settings/incidents/trespass-template/${templateId}`);
  };

  const handleMessageBannerEntered = () => {
    setTimeout(() => {
      // setShow(false)
      setShowErrorBanner(false)
    }, 2800)
  };

  // helper for isFormDataValid to check state not empty
  // (at makeTrespassTemplateObj for PUT the value of getProcessedContentFromEditor() 
  // is used for templateValue not formData.templateValue)
  const handleEditorChange = (content) => {
    const sanitizedContent = DOMPurify.sanitize(content);
    setFormData(prev => ({
      ...prev,
      templateValue: sanitizedContent 
    }))
  };

  const normalizeTemplateName = (name) => {
    return name.toLowerCase().replace(/[\s\-_.,'"]/g, '');
  };

  const getNameIsUnique = () => {
    const normalizedName = normalizeTemplateName(formData.name);
    const isNameUnique = !trespassTemplates.some(
      trespass => normalizeTemplateName(trespass.name) === normalizedName
    );
    return isNameUnique
  };

  const getValidationResults = () => {
    const isNameNotEmpty = formData.name && formData.name.trim() !== '';
    const nameIsUnique = getNameIsUnique();
    const isEditorValid = stripHTML(formData.templateValue);
    return isNameNotEmpty && nameIsUnique && isEditorValid;;
  };

  useEffect(() => {
    if (!getNameIsUnique()) {
      setShowErrorBanner(true)
    } else {
      setShowErrorBanner(false)
    };
  }, [formData, trespassTemplates]);

  useEffect(() => {
    setIsButtonDisabled(!getValidationResults())
  }, [formData, trespassTemplates]);

  const columnWidths = {
    name: '175px',
    isDefault: '80px',
    active: '60px',
    description: '225px'
  };

  const formatter = {
    name: (item) => {
      if (item.name.length > 28) {
        return item.name.slice(0, 28) + "...";
      } else {
        return item.name;
      }
    },
    isDefault: (item) => {
      const isDefault = item.isDefault;
      return isDefault ? <span style={{ color: 'green' }}>
        <Icon icon='check-circle'></Icon>
      </span>
        : null
    },
    active: (item) => {
      const isActive = item.active;
      return isActive ? <span style={{ color: 'green' }}>
        <Icon icon='check-circle'></Icon>
      </span> 
        : <Icon icon='archive'></Icon>
    },
    description: (item) => {
      if (item.description.length >= 28) {
        return item.description.slice(0, 28) + "...";
      } else {
        return item.description;
      }
    }
  };

  const modules = {
    toolbar: {
      container: '#toolbar'
    }
  };

  return (
    <Paneset>
      <Pane
        defaultWidth="fill"
        paneTitle={<FormattedMessage 
          id="settings.trespass-document-paneTitle"/>
        }
      >
        <GetTrespassTemplates />
        {formattedConfigTemplates && 
          <PutTrespassTemplate 
            data={formattedConfigTemplates}
            />}
        {showTokensModal && 
          <ModalTrespassDocTokens 
            setShowTokensModal={setShowTokensModal}
            selectedTokens={selectedTokens} 
            setSelectedTokens={setSelectedTokens}
            handleInsertTokens={handleInsertTokens}
            tokensArray={tokensArray}
            />}
        {showPreviewModal && 
          <ModalPreviewTrespassDoc 
            previewContent={previewContent}
            closePreviewModal={closePreviewModal}
          />}

        <Row>
          <Col xs={12}>
           <MultiColumnList 
            contentData={trespassTemplates}
            visibleColumns={[
              'name',
              'isDefault',
              'active',
              'description'
            ]}
            columnMapping={{
              name: <FormattedMessage id="settings.trespass-document-columnmapping-name"/>,
              isDefault: <FormattedMessage id="settings.trespass-document-columnmapping-default"/>,
              active: <FormattedMessage id="settings.trespass-document-columnmapping-active"/>,
              description: <FormattedMessage id="settings.trespass-document-columnmapping-description"/>
            }}
            columnWidths={columnWidths}
            formatter={formatter}
            onRowClick={handleShowDetails}
          />
          </Col>
        </Row>

         <Row style={{ marginTop: '25px', marginBottom: '25px' }}>
          <Col xs={8}>
            <div style={{ minHeight: '50px' }}>
              <MessageBanner 
                onEntered={() => handleMessageBannerEntered()}
                type="error"
                show={showErrorBanner}>
                <FormattedMessage id="settings.trespass-document-template.message-banner.name-must-be-unique"/>
              </MessageBanner>
            </div>
          </Col>
        </Row>

        <Row style={{ marginTop: '45px' }}>
          <Col xs={6}>
            <TextField 
              required
              label={<FormattedMessage id="settings.trespass-document-textfield-name"/>}
              name='name'
              value={formData.name}
              onChange={handleChange} 
            />
          </Col>
        </Row>
         <Row>
          <Col xs={6}>
            <TextField 
              label={<FormattedMessage id="settings.trespass-document-textfield-description"/>}
              name='description'
              value={formData.description}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={6}>
            <Checkbox 
              label={<FormattedMessage id="settings.trespass-document-checkbox-active"/>}
              name='active'
              checked={formData.active}
              onChange={handleChange}
            />
          </Col>
        </Row>

         <Row>
          <Col xs={6}>
            <Checkbox 
              label={<FormattedMessage id="settings.trespass-document-checkbox-isDefault"/>}
              name='isDefault'
              checked={formData.isDefault}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row style={{ marginTop: '20px'}}>
          <Col xs={12}>
            <div id='toolbar'>
              {/* text formatting */}
              <span className='ql-formats'>
                <button className='ql-bold'></button>
                <button className='ql-italic'></button>
                <button className='ql-underline'></button>
                <button className='ql-strike'></button>
              </span>

              {/* headers */}
              <span className='ql-formats'>
                <select className='ql-header'>
                  <option value='1'></option>
                  <option value='2'></option>
                  <option selected></option>
                </select>
              </span>

              {/* subscript/superscript */}
              <span className='ql-formats'>
                <button className='ql-script' value='sub'></button>
                <button className='ql-script' value='super'></button>
              </span>

              {/* lists */}
              <span className='ql-formats'>
                <button className='ql-list' value='ordered'></button>
                <button className='ql-list' value='bullet'></button>
              </span>

              {/* indentation */}
              <span className='ql-formats'>
                <button className='ql-indent' value='-1'></button>
                <button className='ql-indent' value='+1'></button>
              </span>

              {/* text alignment */}
              <span className='ql-formats'>
                <select className='ql-align'></select>
              </span>

              {/* custom button */}
              <span className='ql-formats'>
                <button 
                  id='custom-button'
                  onClick={handleInsertClick}
                  >
                  Insert
                </button>
              </span>
            </div>
            <Editor
              required 
              modules={modules} 
              editorRef={editorRef}
              onChange={handleEditorChange}
              />
          </Col>
        </Row>
        <Row style={{ marginTop: '20px', marginBottom: '25px'}}>
          <Col xs={4}>
          <Button onClick={handlePreviewClick}>
            <FormattedMessage 
              id="settings.trespass-document-preview-button"
            />
          </Button>
          </Col>
          <Col xs={4}>
          <Button 
            buttonStyle='primary'
            disabled={isButtonDisabled}
            onClick={handleSaveTemplate}>
            <FormattedMessage 
              id="save-and-close-button"
            />
          </Button>
          </Col>
        </Row>
      </Pane>

       <Switch>
        <Route 
          exact
          path="/settings/incidents/trespass-template/:id"
          render={(props) => (
            <TrespassDocDetailsPane 
              {...props} 
              // handleCloseDetails={handleCloseDetails} 

              handleShowEdit={handleShowEdit}
              />
          )}/>
          <Route 
          exact
          path="/settings/incidents/trespass-template/:id/edit"
          render={(props) => (
            <TrespassDocEditPane 
              handleCancelEdit={handleCancelEdit}
              handleCloseEdit={handleCloseEdit}
              {...props} 
           
              />
          )}/>
      </Switch>
    </Paneset>
  )

}

export default TrespassDocPaneset; 