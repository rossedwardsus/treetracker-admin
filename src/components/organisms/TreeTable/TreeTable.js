import React, { Component } from 'react'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import TablePagination from '@material-ui/core/TablePagination'
import Paper from '@material-ui/core/Paper'
import dateFormat from 'dateformat'
import Checkbox from '@material-ui/core/Checkbox'
import Tooltip from '@material-ui/core/Tooltip'

import EnhancedTableHead from '../../molecules/EnhancedTableHead/EnhancedTableHead'

const styles = theme => ({
  root: {
    marginLeft: '80px',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto'
  },
  locationCol: {
    width: '270px'
  }
})

class TreeTable extends Component {

  constructor(props) {
    super(props)
    this.onChangeRowsPerPage = this.onChangeRowsPerPage.bind(this)
  }

  componentDidMount() {
    const payload = {
      page: this.props.page,
      rowsPerPage: this.props.rowsPerPage,
      order: this.props.order,
      orderBy: this.props.orderBy
    }
    this.props.getTreesAsync(payload)
  }

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({ selected: this.state.data.map(n => n.id) })
      return
    }
    this.setState({ selected: [] })
  }

  isSelected = (id) => {
    this.props.selected.indexOf(id) !== -1
  }

  render() {
    const { numSelected, classes, rowsPerPage, selected, order, orderBy, treesArray, getLocationName, byId } = this.props
    return (
      <Paper >
        <Table>
          {/*
           State handling betweenn treetable and EnhancedTableHead are a non-reduxy right now
           We should probably fix that, but it's not a huge problem. Consistency though.
           */ }
          <EnhancedTableHead
            numSelected={numSelected}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={this.handleSelectAllClick}
            onRequestSort={this.handleRequestSort}
            rowCount={rowsPerPage}
          />
          <TableBody>
            {this.props.treesArray.map(tree => {
              const isSelected = this.isSelected(tree.id)
              const location = true //byId[tree.id] ? byId[tree.id].location : false
              // this probably belongs elsewhere…
              const city = ( location && location.city !== undefined )? `${location.city},` : ''
              const country = ( location && location.country !== undefined )? `${location.country}` : ''

              if(!location) getLocationName(tree.id, tree.lat, tree.lon)
              return (
                <TableRow key={tree.id}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected} />
                  </TableCell>
                  <TableCell>{tree.id}</TableCell>
                  <TableCell>{dateFormat(tree.timeCreated, 'mmm dd, yyyy h:MM TT')}</TableCell>
                  <TableCell className={classes.locationCol}>{dateFormat(tree.timeUpdated, 'mmm dd, yyyy h:MM TT')}</TableCell>
                  {location ? (
                    /* @Todo: I'd love to instead send a get request to the API, but we need auth stuff first... */
                    <Tooltip title={`${tree.lat} ${tree.lon}`}>
                        <TableCell>{`${city} ${country}`}</TableCell>
                    </Tooltip>
                  ) : (
                    <TableCell>{`${Number(tree.lat).toPrecision(4)}, ${Number(tree.lon).toPrecision(4)}`}</TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={200}
          rowsPerPage={rowsPerPage}
          page={this.props.page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.onPageChange}
          onChangeRowsPerPage={this.onChangeRowsPerPage}
        />
      </Paper>
    )
  }
  onPageChange = (event, page) => {
    this.props.getTreesAsync({ page: page, rowsPerPage: this.props.rowsPerPage })
  }
  onChangeRowsPerPage = event => {
    this.props.getTreesAsync({ page: this.props.page, rowsPerPage: event.target.value })
  }
}

const mapState = state => {
  const keys = Object.keys(state.trees.data)
  return {
    treesArray: keys.map(id => ({
      ...state.trees.data[id]
    })),
    page: state.trees.page,
    rowsPerPage: state.trees.rowsPerPage,
    selected: state.trees.selected,
    order: state.trees.order,
    orderBy: state.trees.orderBy,
    numSelected: state.trees.selected.length,
    byId: state.trees.byId

  }
}

const mapDispatch = (dispatch) => ({
  getTreesAsync: ({ page, rowsPerPage, order, orderBy }) => dispatch.trees.getTreesAsync({ page: page, rowsPerPage: rowsPerPage, order: order, orderBy: orderBy }),
  getLocationName: (id, lat, lon) => dispatch.trees.getLocationName({ id: id, latitude: lat, longitude: lon })
})

export default compose(
  withStyles(styles, { withTheme: true, name: 'TreeTable' }),
  connect(mapState, mapDispatch)
)(TreeTable)