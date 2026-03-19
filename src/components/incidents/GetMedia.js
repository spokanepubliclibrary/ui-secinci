import React from 'react';
import { stripesConnect } from '@folio/stripes/core';
import { getHeaderWithCredentials } from '@folio/stripes/util';

class GetMedia extends React.Component {
  constructor(props) {
    super(props);
    const { stripes } = this.props;
    const { okapi } = stripes;
    this.okapiURL = okapi.url;
  };

  componentDidMount() {
    this.GetMedia()
  };

  componentDidUpdate(prevProps) {
    if(this.props.id !== prevProps.id || this.props.imageId !== prevProps.imageId) {
      this.GetMedia()
    }
  };

  GetMedia = async () => {
    const { id, imageId, mediaHandler, context, contentType } = this.props;
    const { stripes } = this.props;
    // console.log("stripes: ", JSON.stringify(stripes, null, 2))
    const headersWithCredentials = getHeaderWithCredentials(stripes.okapi);
    const { headers } = headersWithCredentials
    // console.log("headersWithCredentials: ", JSON.stringify(headersWithCredentials, null, 2))
    // console.log("headers: ", JSON.stringify(headers, null, 2))

    if(context === 'thumbnail') {
      if(contentType.startsWith('video')) {
        const placeholderUrl = 'isVideo'
        mediaHandler(placeholderUrl, this.props.imageId)
        return; 
      };

      try {
        const response = await fetch(`${this.okapiURL}/incidents/${id}/media/${imageId}?format=thumbnail`, {
          method: 'GET',
          headers: {
            ...headers
          }
        });
        if(response.status === 200) {
          const blob = await response.blob();
          const mediaUrl = URL.createObjectURL(blob)
          this.props.mediaHandler(mediaUrl, this.props.imageId)
        } 
      } catch (error) {
        console.error('@GetMedia thumbnail context - error: ', error)
      }
    } else if(context === 'original-or-video') {
      try {
        const response = await fetch(`${this.okapiURL}/incidents/${id}/media/${imageId}`, {
          method: 'GET',
          headers: {
            ...headers
          }
        });
        if(response.status === 200) {
          const blob = await response.blob();
          const mediaUrl = URL.createObjectURL(blob)
          this.props.handleDataResponse(mediaUrl)
          // this.props.mediaHandler(mediaUrl, this.props.imageId)
        } 
      } catch (error) {
        console.error('@GetMedia - error: ', error)
      }
    } else if(context === 'document') {
      try {
        const response = await fetch(`${this.okapiURL}/incidents/${id}/media/${imageId}`, {
          method: 'GET',
          headers: {
            ...headers
          }
        });
        if(response.status === 200) {
          // console.log("context === 'document' RAN, the response: ", response)
          const blob = await response.blob();
          const mediaUrl = URL.createObjectURL(blob)
          this.props.mediaHandler(mediaUrl, this.props.imageId)
        } 
      } catch (error) {
        console.error('@GetMedia - error: ', error)
      }
    } else {
      console.log("@GetMedia - no context provided")
    }
  };

  render() {
    return null;
  };
};

export default stripesConnect(GetMedia, '@spokane-folio/security-incident')