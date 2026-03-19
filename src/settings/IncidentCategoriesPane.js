import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  MultiColumnList,
  Pane,
  PaneHeader,
  Row,
  TextField,
} from '@folio/stripes/components';
import makeId from './helpers/makeId';
import GetIncidentCategories from './GetIncidentCategories';
import ModalDeleteCategory from './ModalDeleteCategory';
import { IncidentContext } from '../contexts/IncidentContext';

class IncidentCategoriesPane extends React.Component {
  static contextType = IncidentContext;
  static manifest = Object.freeze({
    incidentCategory: {
      type: 'okapi',
      path: 'incidents/configurations/incident-categories',
      PUT: {
        path: `incidents/configurations/incident-categories`, 
      },
      accumulate: true,
    },
  });

  static propTypes = {
    data: PropTypes.string,
    mutator: PropTypes.shape({
      incidentCategory: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      editableData: [], // local copy for edit in mcl
      editRow: null,
      isClickDelete: false,
      toDeleteId: null,
      prevContextCategories: null // local tracker for comparison
    };
  }

  // move to setting 'setState editableData' with this.context.incidentCategories
  // handleFetchedCategories = (data) => {
  //   this.setState({ editableData: data });
  // };

  componentDidMount() {
    const { incidentCategories } = this.context;
    if (incidentCategories?.length) {
      this.setState({
        editableData: incidentCategories,
        prevContextCategories: incidentCategories // hold what is used
      })
    }
  }

  componentDidUpdate() {
    const { incidentCategories } = this.context;
    if (incidentCategories !== this.state.prevContextCategories) {
      this.setState({
        editableData: incidentCategories,
        prevContextCategories: incidentCategories // hold what is used
      })
    }
  }

  handleTitleChange = (newTitle, id) => {
    this.setState((prevState) => ({
      editableData: prevState.editableData.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      ),
    }));
  };

  handleEdit = (id) => {
    this.setState({ editRow: id });
  };

  preventDuplicateId = (itemTitle) => {
    const existingIds = new Set(this.state.editableData.map(cat => cat.id));
    const baseId = makeId(itemTitle);
    if (!existingIds.has(baseId)) return baseId; 

    // else increment made id value "-1", "-2", ... until gap
    let i = 1;
    let candidate;
    do {
      candidate = `${baseId}-${i}`;
      i += 1; 
    } while (existingIds.has(candidate));

    return candidate
  };

  handleSave = () => {
    const isNewCategory = this.state.editRow === -1;
    let updatedCategories = [...this.state.editableData];

    if (isNewCategory) {
      updatedCategories = updatedCategories.map((item) =>
        item.id === -1 ? { ...item, id: this.preventDuplicateId(item.title) } : item
      );
    };

    console.log("@handleSave - updatedCategories --> ", JSON.stringify(updatedCategories, null, 2))

    const formattedReadyData = {
      data: { 
        value:  {
          categories: updatedCategories
        }  
      }
    };

    console.log("formattedReadyData --> ", JSON.stringify(formattedReadyData, null, 2))

    this.props.mutator.incidentCategory
      .PUT(formattedReadyData)
      .then((response) => {
        console.log('update successful - response: ', JSON.stringify(response, null,2));
      })
      .catch((error) => {
        console.error('@IncidentCategoriesPane error updating: ', error);
      });
    this.setState({ editRow: null });
  };

  handleCancelEdit = () => {
    this.setState((prevState) => {
      const updatedCategories = prevState.editableData.filter(
        (item) => item.id !== -1
      );
      return {
        editableData: updatedCategories,
        // reset editRow to null for both cancel edit and cancel new
        editRow: null,
      };
    });
  };

  handleNew = () => {
    const newCategory = {
      id: -1,
      title: '',
    };
    this.setState((prevState) => ({
      editableData: [newCategory, ...prevState.editableData],
      editRow: -1,
    }));
  };

  handleShowModal = (id) => {
    this.setState({ isClickDelete: true, toDeleteId: id });
  };

  handleCloseModal = () => {
    this.setState({ isClickDelete: false, toDeleteId: null });
  };

  handleDelete = () => {
    const { toDeleteId } = this.state;
    if (toDeleteId) {
      this.setState(
        (prevState) => {
          const updatedCategories = prevState.editableData.filter(
            (item) => item.id !== toDeleteId
          );
          return { editableData: updatedCategories };
        },
        () => {
          const readyFormattedData = {
            data: {
              value: {
                categories: this.state.editableData,
              }
            }
          };
          this.props.mutator.incidentCategory
            .PUT(readyFormattedData)
            .then(() => {
              console.log('removal and update successful');
            })
            .catch((error) => {
              console.error('error in updating after removal: ', error);
            });
          this.handleCloseModal();
        }
      );
    }
  };

  render() {
    const { editableData, editRow, isClickDelete } = this.state;
    const resultsFormatter = {
      title: (item) =>
        editRow === item.id ? (
          <TextField
            value={editableData.find((cat) => cat.id === item.id).title}
            onChange={(e) => this.handleTitleChange(e.target.value, item.id)}
          />
        ) : (
          item.title
        ),
      id: (item) => (
        <div>
          {editRow === item.id ? (
            <div>
              <Button onClick={this.handleCancelEdit}>
                <FormattedMessage id="settings.categories-cancel-button" />
              </Button>
              <Button onClick={this.handleSave}>
                <FormattedMessage id="settings.categories-save-button" />
              </Button>
            </div>
          ) : (
            <div>
              <Button onClick={() => this.handleEdit(item.id)}>
                <FormattedMessage id="edit-button" />
              </Button>
              <Button onClick={() => this.handleShowModal(item.id)}>
                <FormattedMessage id="settings.categories-delete-button" />
              </Button>
            </div>
          )}
        </div>
      ),
    };

    const columnWidths = {
      title: '225px'
    }

    return (
      <Pane
        paneTitle="Incident categories"
        defaultWidth="fill"
        renderHeader={(renderProps) => <PaneHeader {...renderProps} />}
      >
        <Row>
          <Col xs={10}>
            <Button buttonStyle="primary" onClick={this.handleNew}>
              <FormattedMessage id="settings.categories-new-button" />
            </Button>
          </Col>
        </Row>
        <MultiColumnList
          contentData={editableData}
          formatter={resultsFormatter}
          visibleColumns={['title', 'id']}
          columnWidths={columnWidths}
          isEmptyMessage={<FormattedMessage id="settings.categories.mcl-isEmptyMsg" />}
          columnMapping={{
            title: 
              <FormattedMessage id="settings.categories.column-mapping-title" />
            ,
            id: 
              <FormattedMessage id="settings.categories.column-mapping-actions" />
            ,
          }}
        />
        <GetIncidentCategories />
        {isClickDelete && (
          <ModalDeleteCategory
            isOpen={isClickDelete}
            onClose={this.handleCloseModal}
            onConfirm={this.handleDelete}
          />
        )}
      </Pane>
    );
  }
}
IncidentCategoriesPane.contextType = IncidentContext;

export default stripesConnect(IncidentCategoriesPane);