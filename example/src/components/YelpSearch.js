import React from 'react'
import PropTypes from 'prop-types'

class YelpSearch extends React.Component {
  constructor (props) {
    super(props)
    this.state = { term: props.query.term || '' }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (event) {
    this.setState({ term: event.target.value })
  }

  handleSubmit (event) {
    event.preventDefault()
    this.props.onSubmit(this.state.term)
  }

  render () {
    return (
      <form action='/' onSubmit={this.handleSubmit} >
        <input name='term' type='text' value={this.state.term} onChange={this.handleChange} />
        <input type='submit' value='SEARCH' />
      </form>
    )
  }
}

YelpSearch.propTypes = {
  query: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default YelpSearch
