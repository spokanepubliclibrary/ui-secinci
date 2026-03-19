import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { getHeaderWithCredentials } from '@folio/stripes/util';
import { IncidentContext } from '../../contexts/IncidentContext';

class CreateMedia extends React.Component {
  static contextType = IncidentContext;

  constructor(props) {
    super(props);
    const { stripes } = this.props;
    const { okapi } = stripes;
    this.okapiURL = okapi.url;
  };

  componentDidMount() {
    this.createMedia(this.props.id, this.props.formDataArray);
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.id !== prevProps.id &&
      this.props.formDataArray !== prevProps.formDataArray
    ) {
      this.createMedia(this.props.id, this.props.formDataArray);
    }
  };

  // reset states, invoked regardless of 'new' or 'edit' this.props.context cases
  resetStates = () => {
    this.context.setIdForMediaCreate(null);
    this.context.setFormDataArrayForMediaCreate(null);
    this.context.setAttachmentsData([]);
    this.context.setIncidentsList([]);
  };

  createMedia = async (id, formDataArray) => {
    const { stripes } = this.props;
    const headersWithCredentials = getHeaderWithCredentials(stripes.okapi);
    // destructure content type key/value and pass headers w/ out it
    // the browser will set "content type": "multipart/form-data" programmatically
    const headers = { ...headersWithCredentials.headers };
    delete headers['Content-Type'];

    const readyAttachmentsArray = formDataArray.map((att) => {
      const metadata = {
        id: att.id,
        description: att.description,
        contentType: att.contentType,
      };
      const formData = new FormData();
      formData.append('metadata', JSON.stringify(metadata));

      if (att.contentType === 'application/pdf' && !att.file.name) {
        // provide filename for PDF (PDFs are return as Blob w/ out filename)
        formData.append('file', att.file, `${att.id}.pdf`)
      } else {
        formData.append('file', att.file)
      };

      return formData;
    });

    try{
      const results = [];

      for(const attachment of readyAttachmentsArray) {
        const response = await fetch(`${this.okapiURL}/incidents/${id}/media`, {
          method: 'POST',
          headers: {
            ...headers,
          },
          body: attachment,
        });
        results.push(response)
      };

      const allSuccess = results.every(response => response.status === 201);

      if (!allSuccess) {
        console.error('one ore more attachments failed to save')
        return;
      };

      this.resetStates();

      if (this.props.context === 'edit') {
        this.context.setUseGetList(false);
        this.context.setIsLoadingDetails(false);
        this.context.setIsUpdatingReport(false);
        this.props.handleCloseEdit();
        
      } else if (this.props.context === 'new') {
        this.context.setIsCreatingReport(false)
        this.props.handleCloseNewOnSuccess(id);
      }
    } catch (error) {
      this.context.setUseGetList(false);
      console.error('@CreateMedia - in CATCH - error uploading files: ', error);
    }
  };

  render() {
    return <></>;
  };
};

CreateMedia.contextType = IncidentContext;
CreateMedia.propTypes = {
  stripes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  formDataArray: PropTypes.arrayOf(
    PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    file: PropTypes.instanceOf(File).isRequired,
   })
  ).isRequired,
  handleCloseEdit: PropTypes.func,
  handleCloseNewOnSuccess: PropTypes.func,
  context: PropTypes.shape({
    setIdForMediaCreate: PropTypes.string.isRequired,
    setFormDataArrayForMediaCreate: PropTypes.func.isRequired,
    setAttachmentsData: PropTypes.func.isRequired,
    setIncidentsList: PropTypes.func.isRequired,
    setUseGetList: PropTypes.func.isRequired,
  }).isRequired,
};

export default stripesConnect(CreateMedia, '@spokane-folio/security-incident');
