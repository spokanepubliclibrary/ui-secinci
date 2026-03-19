import React, { useEffect, useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import { FormattedMessage } from 'react-intl';
import { useParams, useHistory } from 'react-router-dom';
import {
  AccordionSet,
  Accordion,
  Button,
  Checkbox,
  Col,
  Dropdown,
  DropdownMenu,
  Editor,
  Headline,
  Icon,
  Label,
  List,
  MessageBanner,
  Pane,
  PaneHeader,
  PaneMenu,
  Row,
  TextField
} from '@folio/stripes/components';
import GetTrespassTemplates from './GetTrespassTemplates';
import PutTrespassTemplate from './PutTrespassTemplate';
import ModalTrespassDocTokens from './ModalTrespassDocTokens';
import ModalPreviewTrespassDoc from './ModalPreviewTrespassDoc';
import stripHTML from '../components/incidents/helpers/stripHTML';
import DOMPurify from 'dompurify';
import { tokensArray, tokenValues } from './data/templateTokens';
import { useIncidents } from '../contexts/IncidentContext';

const TrespassDocEditPane = ({handleCancelEdit, handleCloseEdit, ...props}) => {
  const { id } = useParams();
  const history = useHistory();
  const { 
    trespassTemplates
  } = useIncidents();

  const [showTokensModal, setShowTokensModal] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [lastRange, setLastRange] = useState(null);
  const [formattedConfigTemplates, setFormattedConfigTemplates] = useState(null); 
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    active: false,
    isDefault: false,
    description: '',
    templateValue: ''
  });

  useEffect(() => {
    if (trespassTemplates && trespassTemplates.length > 0) {
      const foundTemplate = trespassTemplates.find((template) => template.id === id);
      if (foundTemplate) {
        setFormData({
          id: foundTemplate.id,
          name: foundTemplate.name || '', 
          active: foundTemplate.active || false,
          isDefault: foundTemplate.isDefault || false,
          description: foundTemplate.description || '', // not required
          templateValue: foundTemplate.templateValue || ''
        });
        setOriginalName(foundTemplate.name || '');
        setPreviewContent(foundTemplate.templateValue);
      } else {
        console.log(`template with id ${id} not found`);
        setFormData({
          name: '',
          active: '',
          description: '',
          templateValue: ''
        });
        setPreviewContent('');
      };
    };
  }, [id, trespassTemplates]);

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
    // handleTokenSelect(selectedTokens);
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

  const getContentForSaveUpdate = () => {
    const quill = editorRef.current?.getEditor?.();
    if (quill) {
      const contentHtml = quill.root.innerHTML;
      // console.log("@getContentForSaveUpdate - contentHtml: ", contentHtml)
      return contentHtml;
    } else {
      console.error('quill instance not available')
      return null;
    }
  };

  const getProcessedContent = () => {
    const quill = editorRef.current?.getEditor?.();
    if (quill) {
      const contentHtml = quill.root.innerHTML;
      let processedContent = contentHtml;

      Object.keys(tokenValues).forEach((token) => {
        const value = tokenValues[token];
        // replace special chars as escaped
        const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        // replace regex with matched value
        processedContent = processedContent.replace(regex, value);
      })
      return processedContent;
    } else {
      console.error('quill instance not available')
      return null;
    }
  };

  const handlePreviewClick = () => {
    setShowPreviewModal(true);
    saveCurrentSelection();
    setPreviewContent(getProcessedContent());
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
        // console.log('selection-change:', { range, oldRange, source });
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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    };
  };

  const readyEditedTrespassTemplateObj = (processedTemplate) => {
    const sanitizedContent = DOMPurify.sanitize(processedTemplate);
    return {
      id: formData.id,
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
      isDefault: false,
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
    handleCloseEdit(id)
  };

  const handleSaveTemplate = (e) => {
    if (e) e.preventDefault();
    // obtain ready template
    const readyTemplate = getContentForSaveUpdate();
    // console.log("readyTemplate: ", readyTemplate)
    // make ready template object
    const editedTemplate = readyEditedTrespassTemplateObj(readyTemplate);
    

    // init array
    let updatedTrespassTemplates = [];
    // if edited template is the default template
    if (editedTemplate.isDefault) {
      // convert previous template of default, if any, to 'false' (not default)
      const removedPrevDefaultList = trespassTemplates.map((template) => {
        // ensure if editedTemplate.isDefault === true that it is the only default template
        return { ...template, isDefault: false }
      });
      // merge edited template with updated list 
      updatedTrespassTemplates = [...removedPrevDefaultList, editedTemplate];
    } else {
      updatedTrespassTemplates = [...trespassTemplates, editedTemplate]
    };

    // remove prev version of newly edited template (it's not an update, its a replace)
    const filteredList = updatedTrespassTemplates.filter((template) => template.id !== editedTemplate.id );

    const readyFormattedData = {
      value: {
        templates: [...filteredList, editedTemplate]
      }
    };

    console.log("readyFormattedData -->", JSON.stringify(readyFormattedData, null, 2));

    setFormattedConfigTemplates({ data: readyFormattedData });
    setTimeout(() => {
      resetForFreshTemplateInput();
    }, 800);
  };

  const handleMessageBannerEntered = () => {
    setTimeout(() => {
      setShowErrorBanner(false)
    }, 2800)
  };

  // helper for useEffect to check state not empty
  // (at readyEditedTrespassTemplateObj for PUT the value of getProcessedContent() 
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

  useEffect(() => {
    const isNameNotEmpty = formData.name && formData.name.trim() !== '';
    const normalizedCurrentName = normalizeTemplateName(formData.name);
    const normalizedOriginalName = normalizeTemplateName(originalName);
    const isNameChanged = normalizedCurrentName !== normalizedOriginalName;
    const isNameUnique = !trespassTemplates.some((template) =>
      template.id !== formData.id &&
      normalizeTemplateName(template.name) === normalizedCurrentName
    );
    const isEditorValid = stripHTML(formData.templateValue).trim() !== '';
    setShowErrorBanner(isNameNotEmpty && !isNameUnique && isNameChanged);
    const isValid = isNameNotEmpty && isEditorValid && (isNameUnique || !isNameChanged);

    setIsButtonDisabled(!isValid);
  }, [formData, trespassTemplates, originalName]);

  const modules = {
    toolbar: {
      container: '#toolbar-edit'
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'header', 'script', 'list', 'bullet',
    'indent', 'align',
  ];

  const templateName = formData.name;

  return (
    <Pane
      dismissible
      onClose={() => handleCancelEdit(id)}
      defaultWidth="100%"
      paneTitle={<FormattedMessage 
        id="settings.trespass-document-edit-paneTitle"
        values={{ templateName }}
      />}
      {...props}>

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

      <AccordionSet>
        <Accordion label={<FormattedMessage 
          id="details-pane.accordion-label.details"/>}
        >
          <Row>
            <Col xs={6}>
              <TextField 
                required
                label={<FormattedMessage id="settings.trespass-document-edit-textfield-name-label"/>}
                name='name'
                value={formData.name}
                onChange={handleChange} 
              />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <TextField 
                label={<FormattedMessage id="settings.trespass-document-edit-textfield-description-label"/>}
                name='description'
                value={formData.description}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <Checkbox 
                label={<FormattedMessage id="settings.trespass-document-edit-checkbox-active-label"/>}
                name='active'
                checked={formData.active}
                onChange={handleChange}
              />
            </Col>
          </Row>
           <Row>
            <Col xs={6}>
              <Checkbox 
                label={<FormattedMessage id="settings.trespass-document-edit-checkbox-default-label"/>}
                name='isDefault'
                checked={formData.isDefault}
                onChange={handleChange}
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
        </Accordion>

        <Accordion label='Document'>
          <Row style={{ marginTop: '20px'}}>
            <Col xs={12}>
              <div id='toolbar-edit'>
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
                <select className='ql-align'>
                  <option selected></option>
                  <option value='center'></option>
                  <option value='right'></option>
                  <option value='justify'></option>
                </select>
              </span>

              {/* custom button */}
              <span className='ql-formats'>
                <button 
                  id='custom-button'
                  onClick={handleInsertClick}
                  >
                  <FormattedMessage id="settings.trespass-document-edit-insert-button"/>
                </button>
              </span>
            </div>
              <Editor
                required 
                value={formData.templateValue}
                formats={formats}
                modules={modules} 
                editorRef={editorRef}
                onChange={handleEditorChange}
                style={{ whiteSpace: 'pre-wrap' }}
                />
            </Col>
          </Row>

          <Row style={{ marginTop: '20px'}}>
            <Col xs={4}>
              <Button
                onClick={handlePreviewClick}
              >
                <FormattedMessage id="settings.trespass-document-edit-preview-button"/>
              </Button>
            </Col>
            <Col xs={4}>
              <Button 
                buttonStyle='primary'
                disabled={isButtonDisabled}
                onClick={handleSaveTemplate}>
                <FormattedMessage id="save-and-close-button"/>
              </Button>
            </Col>
          </Row>          
        </Accordion>
      </AccordionSet>
    </Pane>
  );
};

export default TrespassDocEditPane; 