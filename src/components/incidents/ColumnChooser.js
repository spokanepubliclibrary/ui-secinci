import React from 'react';
import { Checkbox } from '@folio/stripes/components';
import { Row, Col, Label } from '@folio/stripes/components';

const ColumnChooser = ({
  possibleColumns,
  visibleColumns,
  toggleColumn,
  columnLabels = {} // default empty obj
}) => (
  <>
    <Label>
      Choose columns
    </Label>
    <Row style={{ marginLeft: '3px' }}>
      <Col>
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {possibleColumns.map(colId => (
            <li key={colId}>
              <Checkbox
                value={colId}
                checked={visibleColumns.includes(colId)}
                label={columnLabels[colId] ?? colId}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleColumn(colId);
                }}
              />
            </li>
          ))}
        </ul>
      </Col>
    </Row>
  </>
);

export default ColumnChooser;